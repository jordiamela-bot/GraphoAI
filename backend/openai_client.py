import os
import json
from openai import OpenAI
from pydantic import BaseModel, Field
from typing import List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Define structured Pydantic schema for the report
class PersonalitySection(BaseModel):
    fortaleses: str = Field(description="Descripció de les fortaleses de personalitat")
    debilitats: str = Field(description="Descripció de les debilitats de personalitat, en llenguatge prudent")
    forma_de_pensar: str = Field(description="Estil cognitiu, forma de processar informació")
    intelligencia_practica: str = Field(description="Nivell d'intel·ligència pràctica i sentit comú")
    creativitat: str = Field(description="Nivell i tipus de creativitat detectat")
    organitzacio: str = Field(description="Nivell d'ordre i planificació")
    capacitat_aprenentatge: str = Field(description="Capacitat d'assimilar nous conceptes")
    capacitat_analitica: str = Field(description="Nivell d'anàlisi i capacitat crítica")
    autocontrol: str = Field(description="Capacitat de contenir impulsos i reaccions")
    constancia: str = Field(description="Nivell de compromís i persistència")
    motivacio: str = Field(description="Forces motivadores subjacents")

class RelationsSection(BaseModel):
    empatia: str = Field(description="Capacitat de connectar amb els sentiments dels altres")
    comunicacio: str = Field(description="Estil de comunicació (obert, reservat, clar)")
    lideratge: str = Field(description="Estil i potencial de lideratge")
    treball_en_equip: str = Field(description="Facilitat de col·laboració en grup")
    capacitat_escolta: str = Field(description="Disposició a rebre inputs externs")
    assertivitat: str = Field(description="Estil d'expressió de necessitats pròpies")
    adaptacio: str = Field(description="Flexibilitat al canvi d'entorn")

class WorkplaceSection(BaseModel):
    administracio: str = Field(description="Grau de compatibilitat (Alta, Mitjana, Baixa) i breu raonament")
    vendes: str
    direccio: str
    investigacio: str
    enginyeria: str
    creativitat: str
    atencio_public: str
    gestio: str
    treball_individual: str
    treball_en_equip: str

class RecommendationsSection(BaseModel):
    entorns_compatibles: str = Field(description="Entorns físics i organitzatius de treball recomanats")
    estil_lideratge: str = Field(description="Estil de lideratge que millor s'ajusta a la persona")
    forma_comunicacio: str = Field(description="Com comunicar-se eficaçment amb aquesta persona")
    factors_motivadors: str = Field(description="Quins elements la mantindran motivada")

class RadarIndexes(BaseModel):
    lideratge: int = Field(description="Nivell de 0 a 100")
    organitzacio: int = Field(description="Nivell de 0 a 100")
    creativitat: int = Field(description="Nivell de 0 a 100")
    empatia: int = Field(description="Nivell de 0 a 100")
    constancia: int = Field(description="Nivell de 0 a 100")
    comunicacio: int = Field(description="Nivell de 0 a 100")
    iniciativa: int = Field(description="Nivell de 0 a 100")
    flexibilitat: int = Field(description="Nivell de 0 a 100")
    autocontrol: int = Field(description="Nivell de 0 a 100")
    treball_en_equip: int = Field(description="Nivell de 0 a 100")

class GraphologyReport(BaseModel):
    resum_executiu: str = Field(description="Resum de l'anàlisi d'unes 5 a 10 línies")
    personalitat: PersonalitySection
    relacions_personals: RelationsSection
    entorn_laboral: WorkplaceSection
    aspectes_atencio: List[str] = Field(description="Llista d'aspectes a millorar redactats amb molta cautela i suavitat")
    fortaleses: List[str] = Field(description="Llista de punts forts clars de l'escriptura")
    recomanacions: RecommendationsSection
    indexes: RadarIndexes

def generate_graphology_report(features_data):
    """
    Sends calculated features to OpenAI API and generates the report.
    Falls back to mock report if OPENAI_API_KEY is not configured.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        # Return realistic simulated report in Demo Mode
        return get_demo_report(features_data), True
        
    client = OpenAI(api_key=api_key)
    
    prompt_content = (
        "Ets especialista en grafologia clàssica europea.\n"
        "Rep un conjunt de característiques objectives extretes automàticament de l'escriptura:\n"
        f"{json.dumps(features_data, indent=2)}\n\n"
        "Redacta un informe grafopsicològic complet detallant les seccions del format especificat.\n"
        "REGLA CRÍTICA: No afirmis mai que les conclusions són certes. Utilitza expressions com:\n"
        "- podria indicar\n"
        "- és compatible amb\n"
        "- segons la grafologia\n"
        "- s'acostuma a associar\n"
        "- s'observa una tendència a\n"
        "NO facis diagnòstics mèdics.\n"
        "NO facis afirmacions sobre salut mental ni trastorns.\n"
        "NO facis afirmacions sobre criminalitat o deshonestedat.\n"
        "NO utilitzis llenguatge absolut ni categòric. El to ha de ser extremadament professional, analític i prudent."
    )
    
    try:
        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Ets un consultor grafopsicològic sènior especialitzat en grafologia europea. Generes informes en català."},
                {"role": "user", "content": prompt_content}
            ],
            response_format=GraphologyReport,
            temperature=0.7
        )
        return response.choices[0].message.parsed.model_dump(), False
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        # Fallback to demo mode report
        return get_demo_report(features_data), True

def get_demo_report(features_data):
    """Generates a high-quality simulated report based on computed features."""
    grandaria = features_data.get('grandaria', {}).get('value', 'Mitjana')
    inclinacio = features_data.get('inclinacio', {}).get('value', 'Vertical')
    pressio = features_data.get('pressio_aparent', {}).get('value', 'Mitjana')
    lligams = features_data.get('lligams', {}).get('value', 'Agrupada')
    linea_base = features_data.get('linea_base', {}).get('value', 'Horitzontal')
    
    # Calculate some base index values based on features
    is_dextrogira = "dreta" in inclinacio.lower()
    is_sinistrogira = "esquerra" in inclinacio.lower()
    is_vertical = "vertical" in inclinacio.lower()
    is_gran = "gran" in grandaria.lower()
    is_petita = "petita" in grandaria.lower()
    
    # Simple logic to determine radar indices
    lideratge = 75 if is_dextrogira and is_gran else (50 if is_vertical else 60)
    organitzacio = 85 if is_vertical else (70 if lligams == "Lligada" else 65)
    creativitat = 80 if is_gran and lligams == "Deslligada" else 70
    empatia = 80 if is_dextrogira else (55 if is_vertical else 65)
    constancia = 80 if linea_base == "Horitzontal / Recta" else 70
    comunicacio = 78 if is_dextrogira else 60
    iniciativa = 82 if is_dextrogira else 58
    flexibilitat = 75 if lligams == "Agrupada / Mixta" else 60
    autocontrol = 85 if is_vertical else 65
    treball_equip = 80 if lligams == "Lligada (Connectada)" or lligams == "Agrupada / Mixta" else 55

    report = {
        "resum_executiu": (
            "Aquest informe grafopsicològic s'ha realitzat a partir de les mètriques gràfiques calculades automàticament. "
            f"L'escriptura, de grandària {grandaria.lower()} i inclinació {inclinacio.lower()}, reflecteix un patró d'energia "
            f"compatible amb una pressió {pressio.lower()}. Segons la grafologia clàssica europea, la distribució de les paraules "
            "i les línies és pròpia d'una persona que sap gestionar els seus espais de reflexió i interacció. "
            "Es pot observar una tendència general a mantenir un equilibri entre el pensament racional i el component intuïtiu. "
            "Aquest perfil suggereix competències professionals sòlides en entorns on es requereixi anàlisi i adaptabilitat."
        ),
        "personalitat": {
            "fortaleses": "S'observa una configuració compatible amb l'agilitat mental, capacitat d'adaptació ràpida a les circumstàncies i facilitat per a l'anàlisi de detalls.",
            "debilitats": "Segons la grafologia, podria existir certa tendència a la impaciència o a una lleugera dispersió quan s'enfronta a tasques rutinàries prolongades.",
            "forma_de_pensar": f"L'escriptura {lligams.lower()} suggereix una combinació eficient de pensament lògic i deductiu. S'acostuma a associar amb persones que saben connectar idees de manera coherent sense perdre la flexibilitat.",
            "intelligencia_practica": "La proporció de les zones de l'escriptura indica un sentit pràctic ben desenvolupat, orientat a resoldre problemes de la vida quotidiana de manera executiva.",
            "creativitat": "La grafia corba i dinàmica és compatible amb una bona capacitat imaginativa, especialment orientada a la innovació en procediments i a la recerca d'alternatives originals.",
            "organitzacio": f"La regularitat de les línies i els marges suggereix un nivell d'organització alt. Aquesta disposició s'acostuma a associar amb mètode i claredat mental.",
            "capacitat_aprenentatge": "La grandària de la grafia i la claredat dels enllaços podrien correspondre a una bona capacitat de retenció de conceptes nous i a una flexibilitat per incorporar nous mètodes.",
            "capacitat_analitica": "La presència d'algunes grafies desconnectades i detalls precisos apunta cap a una capacitat d'anàlisi notable, permetent desglossar els problemes en les seves parts fonamentals.",
            "autocontrol": f"La tendència {inclinacio.lower()} és compatible amb un autocontrol adequat, on la ment racional tendeix a supervisar i regular de manera eficaç els impulsos primaris.",
            "constancia": "El manteniment de la línia base suggereix un nivell de constància estable, essent capaç de dur a terme projectes a mitjà i llarg termini amb perseverança.",
            "motivacio": "S'acostuma a motivar per reptes intel·lectuals, el reconeixement de la feina ben feta i la llibertat per organitzar la seva pròpia activitat professional."
        },
        "relacions_personals": {
            "empatia": "L'arrodoniment de determinats traços s'associa amb una sensibilitat receptiva vers els altres, facilitant l'empatia sense arribar a perdre la distància professional necessària.",
            "comunicacio": "Compatible amb un estil de comunicació directe i expressiu, facilitat per l'obertura general de l'escriptura.",
            "lideratge": "La combinació de grandària i direcció podria indicar un estil de lideratge participatiu, guiant mitjançant l'exemple i la persuasió més que no pas per la força.",
            "treball_en_equip": "S'observa una tendència molt favorable al treball en equip. La fluïdesa d'idees facilita la col·laboració harmònica.",
            "capacitat_escolta": "La distància regular entre paraules és compatible amb una disposició a escoltar abans d'emetre judicis o opinions.",
            "assertivitat": "L'equilibri en la pressió i el traç és propi d'una autoafirmació ferma però respectuosa amb l'entorn social.",
            "adaptacio": "La presència de traços mixtos (agrupats) s'acostuma a associar amb una excel·lent capacitat d'adaptació a diferents perfils humans i cultures de treball."
        },
        "entorn_laboral": {
            "administracio": "Mitjana-Alta. Mostra rigor en l'ordre espacial, tot i que podria avorrir-se en tasques repetitives.",
            "vendes": "Alta. La fluïdesa i el component d'extraversió suggereixen habilitats de persuasió i empatia amb el client.",
            "direccio": "Alta. Capacitat d'organització i autocontrol compatibles amb la presa de decisions estratègiques.",
            "investigacio": "Alta. La fragmentació puntual i la grandària mitjana suggereixen un bon perfil per al detall científic.",
            "enginyeria": "Alta. El pensament lògic-deductiu extret s'adapta molt bé a la resolució estructurada de problemes.",
            "creativitat": "Alta. Grafia amb bones corbes i espai, ideal per al disseny i solucions fora de la caixa.",
            "atencio_public": "Alta. El to de comunicació empàtic i assertiu és molt adequat per a la cura de l'usuari.",
            "gestio": "Alta. L'equilibri general de l'escriptura és compatible amb la coordinació de recursos i projectes.",
            "treball_individual": "Mitjana-Alta. Té prou autonomia i autocontrol per avançar de manera independent.",
            "treball_en_equip": "Alta. Preferència per a la cooperació i per compartir fites de manera col·laborativa."
        },
        "aspectes_atencio": [
            "Segons la grafologia, podria existir una tendència a la impaciència en situacions de ritme lent o excessivament burocràtiques.",
            "Aquesta configuració d'escriptura s'acostuma a associar amb una vulnerabilitat a l'estrès si s'acumulen tasques desorganitzades.",
            "La grafia podria suggerir una certa dificultat per dir que no, atesa la marcada tendència a la complaença social."
        ],
        "fortaleses": [
            "Excel·lent capacitat d'organització mental i claredat en l'exposició d'idees.",
            "Equilibri notable entre l'anàlisi de detalls i la visió de conjunt.",
            "Estil de comunicació transparent, obert i orientat a l'entesa mútua."
        ],
        "recomanacions": {
            "entorns_compatibles": "Entorns moderns de treball, dinàmics, que afavoreixin la col·laboració i on es fomenti la meritocràcia.",
            "estil_lideratge": "Lideratge participatiu o coaching, on es valori l'empoderament de l'equip i el diàleg constant.",
            "forma_comunicacio": "S'aconsella utilitzar un estil directe, estructurat, respectant els seus torns de reflexió i exposant fets basats en dades.",
            "factors_motivadors": "L'autonomia en l'organització horària, l'accés a formació contínua i el repte intel·lectual."
        },
        "indexes": {
            "lideratge": lideratge,
            "organitzacio": organitzacio,
            "creativitat": creativitat,
            "empatia": empatia,
            "constancia": constancia,
            "comunicacio": comunicacio,
            "iniciativa": iniciativa,
            "flexibilitat": flexibilitat,
            "autocontrol": autocontrol,
            "treball_en_equip": treball_equip
        }
    }
    return report
