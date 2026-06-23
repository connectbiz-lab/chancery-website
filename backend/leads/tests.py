from django.core import mail
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import DepartmentContact, Lead
from .routing import resolve_routing


class RoutingTests(TestCase):
    def setUp(self):
        DepartmentContact.objects.create(
            hotel="chancery", department="reservations", notify_email="resv.tch@x.com"
        )
        DepartmentContact.objects.create(
            hotel="pavilion", department="events", notify_email="events.tcp@x.com"
        )
        DepartmentContact.objects.create(
            hotel="both", department="careers", notify_email="jobs@x.com"
        )
        DepartmentContact.objects.create(
            hotel="both", department="general", notify_email="sales@x.com"
        )

    def test_exact_match(self):
        rec, label, _ = resolve_routing("chancery", "stay")
        self.assertEqual(rec, ["resv.tch@x.com"])
        self.assertEqual(label, "Reservations")

    def test_brand_level_match(self):
        rec, _, _ = resolve_routing("either", "careers")
        self.assertEqual(rec, ["jobs@x.com"])

    def test_fallback_to_general(self):
        # No (pavilion, reservations) row exists → falls back to general/sales.
        rec, label, _ = resolve_routing("pavilion", "stay")
        self.assertEqual(rec, ["sales@x.com"])
        self.assertEqual(label, "General Enquiry")


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class ContactSubmitTests(TestCase):
    def setUp(self):
        DepartmentContact.objects.create(
            hotel="pavilion", department="events", notify_email="events.tcp@x.com"
        )

    def test_submit_routes_and_acknowledges(self):
        resp = APIClient().post(
            "/api/contact/",
            {
                "name": "Asha R",
                "email": "asha@example.com",
                "interest": "event",
                "hotel_interest": "pavilion",
                "message": "Wedding for 200.",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 201)

        lead = Lead.objects.get(email="asha@example.com")
        self.assertEqual(lead.routed_to, "events.tcp@x.com")
        self.assertEqual(lead.status, "new")

        self.assertEqual(len(mail.outbox), 2)
        dept_mail, guest_mail = mail.outbox
        self.assertEqual(dept_mail.to, ["events.tcp@x.com"])
        self.assertEqual(dept_mail.reply_to, ["asha@example.com"])  # staff reply hits the guest
        self.assertEqual(guest_mail.to, ["asha@example.com"])
