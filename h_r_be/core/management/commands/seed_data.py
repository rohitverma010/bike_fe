from django.core.management.base import BaseCommand

from core.models import Bike, Homestay


class Command(BaseCommand):
    help = "Seed the database with the StayNRide Rewalsar homestays and bike fleet."

    def handle(self, *args, **options):
        if not Homestay.objects.exists():
            Homestay.objects.bulk_create([
                Homestay(
                    name="Verma Homestay",
                    location="Rewalsar, Mandi, Himachal Pradesh",
                    price_per_night=1800,
                    rating=5.0,
                    image="https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?w=800",
                    description=(
                        "A warm family-run homestay near Rewalsar Lake with mountain views, "
                        "home-cooked Himachali meals and a peaceful courtyard."
                    ),
                    guests=4, beds=2,
                    amenities="WiFi,Home Cooked Meals,Mountain View,Parking,Hot Water",
                ),
                Homestay(
                    name="Rohit Homestay",
                    location="Rewalsar, Mandi, Himachal Pradesh",
                    price_per_night=1600,
                    rating=5.0,
                    image="https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800",
                    description=(
                        "Comfortable and affordable homestay walking distance from Rewalsar Lake "
                        "and monasteries, run by a friendly local family."
                    ),
                    guests=4, beds=2,
                    amenities="WiFi,Home Cooked Meals,Parking,Hot Water,Balcony",
                ),
            ])
            self.stdout.write(self.style.SUCCESS("Seeded 2 homestays."))
        else:
            self.stdout.write("Homestays already seeded, skipping.")

        if not Bike.objects.exists():
            Bike.objects.bulk_create([
                Bike(
                    name="TVS NTorq", type="Scooter", location="Rewalsar, Mandi, Himachal Pradesh",
                    price_per_day=800, security_deposit=2000, rating=5.0,
                    image="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800",
                    description="Sporty automatic scooter, easy to ride around Rewalsar and nearby lanes.",
                    gear="Automatic", quantity=5,
                ),
                Bike(
                    name="Honda Activa", type="Scooter", location="Rewalsar, Mandi, Himachal Pradesh",
                    price_per_day=800, security_deposit=2000, rating=5.0,
                    image="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800",
                    description="Reliable and fuel-efficient scooter, perfect for local sightseeing.",
                    gear="Automatic", quantity=5,
                ),
                Bike(
                    name="TVS Jupiter", type="Scooter", location="Rewalsar, Mandi, Himachal Pradesh",
                    price_per_day=800, security_deposit=2000, rating=5.0,
                    image="https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800",
                    description="Comfortable and smooth automatic scooter, great for two people.",
                    gear="Automatic", quantity=5,
                ),
                Bike(
                    name="Royal Enfield Himalayan", type="Adventure", location="Rewalsar, Mandi, Himachal Pradesh",
                    price_per_day=1500, security_deposit=2000, rating=5.0,
                    image="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800",
                    description="Purpose-built adventure tourer for the mountains, ideal for Rewalsar and nearby hill routes.",
                    gear="Manual - 5 Speed", quantity=5,
                    is_package_bike=True, package_security_deposit=5999,
                ),
                Bike(
                    name="Royal Enfield Hunter", type="Street", location="Rewalsar, Mandi, Himachal Pradesh",
                    price_per_day=1200, security_deposit=2000, rating=5.0,
                    image="https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800",
                    description="Nimble and fun retro-street bike, great for winding hill roads.",
                    gear="Manual - 5 Speed", quantity=5,
                ),
                Bike(
                    name="Hero Xpulse", type="Adventure", location="Rewalsar, Mandi, Himachal Pradesh",
                    price_per_day=1399, security_deposit=2000, rating=5.0,
                    image="https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800",
                    description="Light and capable off-road ready bike, fun for hill and trail routes around Rewalsar.",
                    gear="Manual - 5 Speed", quantity=5,
                    is_package_bike=True, package_security_deposit=5999,
                ),
                Bike(
                    name="Royal Enfield Classic 350 Bullet", type="Cruiser", location="Rewalsar, Mandi, Himachal Pradesh",
                    price_per_day=1500, security_deposit=2000, rating=5.0,
                    image="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800",
                    description="Iconic thumper cruiser, perfect for touring the mountains around Rewalsar in style.",
                    gear="Manual - 5 Speed", quantity=5,
                ),
            ])
            self.stdout.write(self.style.SUCCESS("Seeded 7 bikes."))
        else:
            self.stdout.write("Bikes already seeded, skipping.")
