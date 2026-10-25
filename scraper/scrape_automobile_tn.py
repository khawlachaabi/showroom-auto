"""
Web scraping de automobile.tn (voitures neuves)
------------------------------------------------
Ce script :
  1. ouvre la page de chaque marque (ex : https://www.automobile.tn/fr/neuf/audi)
  2. recupere la liste des modeles : nom, prix, photo, lien
  3. ouvre la page de chaque modele pour lire la fiche technique (puissance, energie...)
  4. telecharge les photos dans public/images/scraped/
  5. ecrit les voitures dans :
       - scraper/cars.json                  (resultat brut, format JSON)
       - src/app/data/scraped-autos.ts       (utilise par Angular, type Auto[])

Lancement (depuis le dossier du projet) :
  pip install -r scraper/requirements.txt
  python scraper/scrape_automobile_tn.py

Le robots.txt du site autorise l exploration (Allow: /).
On reste poli : peu de pages et une pause entre chaque requete.
"""

import json
import random
import re
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://www.automobile.tn"
# slug dans l url -> nom affiche dans le showroom
# (Alfa Romeo n est pas vendue en neuf sur automobile.tn)
BRANDS = {
    "mercedes-benz": "Mercedes-Benz",
    "jaguar": "Jaguar",
    "audi": "Audi",
    "bmw": "BMW",
    "land-rover": "Land Rover",
}
MAX_PER_BRAND = 8   # nombre maximum de modeles par marque
PAUSE = 1           # secondes d attente entre deux requetes
HEADERS = {"User-Agent": "Mozilla/5.0 (projet etudiant showroom-auto)"}

ROOT = Path(__file__).resolve().parent.parent   # dossier du projet Angular
IMAGES_DIR = ROOT / "public" / "images" / "scraped"
JSON_FILE = ROOT / "scraper" / "cars.json"
TS_FILE = ROOT / "src" / "app" / "data" / "scraped-autos.ts"


def get_page(url):
    """Telecharge une page et la transforme en objet BeautifulSoup."""
    time.sleep(PAUSE)
    response = requests.get(url, headers=HEADERS, timeout=20)
    response.raise_for_status()   # erreur si la page n existe pas (404...)
    return BeautifulSoup(response.text, "html.parser")


def to_number(text):
    """'209 000 DT' -> 209000   |   'N.C.' -> None"""
    digits = re.sub(r"[^\d]", "", text or "")
    return int(digits) if digits else None


def scrape_brand(slug):
    """Liste des modeles d une marque : [{name, price, image, url}, ...]"""
    soup = get_page(f"{BASE_URL}/fr/neuf/{slug}")
    models = []
    # chaque modele est dans <div class="versions-item"><a href="..."> ... </a></div>
    for link in soup.select(".versions-item a"):
        name = link.find("h2")
        price = link.select_one(".price span")
        if not name or not price:
            continue
        # la photo : on prefere la version .webp (plus legere)
        webp = link.select_one('picture source[type="image/webp"]')
        image = webp["srcset"] if webp else link.find("img")["src"]
        models.append({
            "name": name.get_text(strip=True),
            "price": to_number(price.get_text()),
            "image": image,
            "url": BASE_URL + link["href"],
        })
    return models[:MAX_PER_BRAND]


def scrape_specs(url):
    """Fiche technique d un modele : {'Energie': 'Essence', 'Puissance (ch.din)': '150 CH', ...}"""
    soup = get_page(url)
    # certains modeles ont plusieurs versions : la page est alors une liste
    # (<table class="versions">) sans fiche technique -> on suit la 1ere version
    first_version = soup.select_one("table.versions td.version a")
    if first_version:
        return scrape_specs(BASE_URL + first_version["href"])
    specs = {}
    # chaque ligne du tableau : <tr><th>Energie</th><td>Essence</td></tr>
    for row in soup.select("tr"):
        th, td = row.find("th"), row.find("td")
        if th and td:
            specs[th.get_text(strip=True)] = td.get_text(" ", strip=True)
    # nom complet de la version, lu dans la balise <meta name="description">
    meta = soup.find("meta", attrs={"name": "description"})
    full_name = ""
    if meta:
        full_name = meta["content"].replace("Prix et fiche technique de la ", "").replace(" en Tunisie", "")
    return specs, full_name


# le site est en francais : on traduit les valeurs de la fiche technique
# pour que l interface du showroom soit entierement en anglais
TRANSLATIONS = {
    "Compacte": "compact car", "Berline": "sedan", "SUV": "SUV", "Coupé": "coupe",
    "Cabriolet": "convertible", "Break": "estate", "Citadine": "city car",
    "Monospace": "MPV", "Crossover": "crossover", "Pick-up": "pickup", "Roadster": "roadster",
    "Essence": "petrol", "Diesel": "diesel", "Hybride": "hybrid", "Hybride léger": "mild-hybrid",
    "Hybride rechargeable": "plug-in hybrid", "Electrique": "electric", "Électrique": "electric",
    "Automatique": "automatic", "Manuelle": "manual",
}


def translate(value):
    """'Berline' -> 'sedan'   |   'Essence | Hybride léger' -> 'petrol mild-hybrid'"""
    parts = [part.strip() for part in value.split("|") if part.strip()]
    return " ".join(TRANSLATIONS.get(part, part.lower()) for part in parts)


def english_name(name):
    """Noms des modeles au format international : 'Classe A Berline' -> 'A-Class Sedan', 'Série 3' -> '3 Series'"""
    name = re.sub(r"Classe ([A-Z]+)", r"\1-Class", name)
    name = re.sub(r"Série (\d)", r"\1 Series", name)
    for french, english in [("Berline", "Sedan"), ("Hybride", "Hybrid"), ("Coupé", "Coupe"),
                            ("Edition Spéciale", "Special Edition")]:
        name = name.replace(french, english)
    return name


def make_description(full_name, specs, power):
    """Construit une petite description (en anglais) a partir de la fiche technique."""
    energy = translate(specs.get("Energie", ""))
    body = translate(specs.get("Carrosserie", "vehicle"))
    sentence = f"{full_name}: {energy} {body}".replace("  ", " ")
    if power:
        sentence += f" with {power} hp"
    if specs.get("Boîte"):
        sentence += f", {translate(specs['Boîte'])} gearbox"
    if specs.get("Nombre de places"):
        sentence += f", {specs['Nombre de places']} seats"
    sentence += "."
    if specs.get("0-100 Km/h"):
        sentence += f" 0 to 100 km/h in {specs['0-100 Km/h']}."
    if specs.get("Vitesse maxi"):
        sentence += f" Top speed: {specs['Vitesse maxi'].lower()}."
    # 'Garantie' : '3 ans' ou '5 ans / 150 000 km' -> on garde seulement le 1er nombre
    warranty = re.match(r"\s*(\d+)", specs.get("Garantie", ""))
    years = warranty.group(1) if warranty else None
    if years:
        sentence += f" {years}-year warranty."
    return sentence + " (Source: automobile.tn)"


def download_image(url, filename):
    """Telecharge la photo dans public/images/scraped/ (Angular la sert dans images/scraped/)."""
    time.sleep(PAUSE)
    response = requests.get(url, headers=HEADERS, timeout=20)
    response.raise_for_status()
    (IMAGES_DIR / filename).write_bytes(response.content)


def main():
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    TS_FILE.parent.mkdir(parents=True, exist_ok=True)
    # le site ne donne pas le stock : on l invente (toujours le meme grace a la graine 42)
    stock = random.Random(42)
    autos = []

    for slug, brand in BRANDS.items():
        print(f"== {brand}")
        for model in scrape_brand(slug):
            try:
                specs, full_name = scrape_specs(model["url"])
                power = to_number(specs.get("Puissance (ch.din)", "")) or 0
                car_id = len(autos) + 1
                ext = ".webp" if ".webp" in model["image"] else ".png"
                photo = f"{car_id}{ext}"
                download_image(model["image"], photo)
                # "Audi Q3 Sportback" -> modele "Q3 Sportback"
                name = model["name"]
                model_name = name[len(brand):].strip() if name.lower().startswith(brand.lower()) else name
                model_name = english_name(model_name)
                autos.append({
                    "id": car_id,
                    "brand": brand,
                    "model": model_name,
                    # le showroom affiche les prix en milliers de DNT (pipe dnt)
                    "price": round(model["price"] / 1000, 3),
                    "power": power,
                    "photo": "scraped/" + photo,
                    "availability": stock.choice([0, 1, 2, 3, 4, 5, 6]),
                    "description": make_description(english_name(full_name or name), specs, power),
                })
                print(f"   ok  {name}  {model['price']} DT  {power} ch")
            except Exception as error:
                # une page en erreur ne doit pas arreter tout le script
                print(f"   !!  {model['name']} ignore : {error}")

    # 1) resultat brut en JSON
    JSON_FILE.write_text(json.dumps(autos, indent=2, ensure_ascii=False), encoding="utf-8")
    # 2) fichier TypeScript lu par Angular
    TS_FILE.write_text(
        "// fichier genere automatiquement par scraper/scrape_automobile_tn.py\n"
        "// ne pas modifier a la main : relancer le script pour mettre a jour\n"
        "import { Auto } from '../interfaces/auto';\n\n"
        "export const SCRAPED_AUTOS: Auto[] = "
        + json.dumps(autos, indent=2, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print(f"\n{len(autos)} voitures enregistrees dans {JSON_FILE.name} et {TS_FILE.name}")


if __name__ == "__main__":
    main()
