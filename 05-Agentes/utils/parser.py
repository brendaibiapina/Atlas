"""
parser.py — Utilitários de parse HTML para os agentes ATLAS
"""

import re
from bs4 import BeautifulSoup
from loguru import logger


def soupify(html: str) -> BeautifulSoup:
    """Converte HTML em BeautifulSoup."""
    return BeautifulSoup(html, "lxml")


def clean_text(text: str) -> str:
    """Limpa espaços extras e quebras de linha."""
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def extract_date_from_text(text: str) -> str | None:
    """
    Tenta extrair uma data no formato DD/MM/YYYY do texto.
    Retorna no formato YYYY-MM-DD (ISO).
    """
    patterns = [
        r'(\d{2})/(\d{2})/(\d{4})',      # DD/MM/YYYY
        r'(\d{2})\.(\d{2})\.(\d{4})',      # DD.MM.YYYY
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            day, month, year = match.groups()
            return f"{year}-{month}-{day}"
    return None


def extract_date_from_title(title: str) -> str | None:
    """
    Extrai data de publicação a partir do título de uma norma.
    Ex: "Lei Complementar nº 214, de 16 de janeiro de 2025" → "2025-01-16"
    """
    meses = {
        'janeiro': '01', 'fevereiro': '02', 'março': '03', 'marco': '03',
        'abril': '04', 'maio': '05', 'junho': '06',
        'julho': '07', 'agosto': '08', 'setembro': '09',
        'outubro': '10', 'novembro': '11', 'dezembro': '12'
    }
    
    # Padrão: "de DD de MÊS de YYYY"
    pattern = r'de\s+(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})'
    match = re.search(pattern, title.lower())
    if match:
        day = match.group(1).zfill(2)
        month_name = match.group(2)
        year = match.group(3)
        month = meses.get(month_name)
        if month:
            return f"{year}-{month}-{day}"
    
    return None


def extract_source_type(title: str) -> str:
    """Determina o tipo de fonte a partir do título da norma."""
    title_lower = title.lower()
    
    if 'emenda constitucional' in title_lower:
        return 'CAMARA'
    elif 'lei complementar' in title_lower:
        return 'DOU'
    elif 'portaria' in title_lower:
        return 'RFB'
    elif 'instrução normativa' in title_lower or 'instrucao normativa' in title_lower:
        return 'RFB'
    elif 'ato conjunto' in title_lower or 'ato declaratório' in title_lower:
        return 'RFB'
    elif 'decreto' in title_lower:
        return 'DOU'
    else:
        return 'RFB'


def generate_tags(title: str, summary: str = "") -> list[str]:
    """Gera tags automaticamente a partir do título e resumo."""
    text = f"{title} {summary}".upper()
    tags = []
    
    keyword_tags = {
        'IBS': ['IBS', 'IMPOSTO SOBRE BENS'],
        'CBS': ['CBS', 'CONTRIBUIÇÃO SOBRE BENS', 'CONTRIBUICAO SOBRE BENS'],
        'IS': ['IMPOSTO SELETIVO', 'SELETIVO'],
        'OBRIGACOES': ['OBRIGAÇ', 'OBRIGAC', 'NF-E', 'NFS-E', 'CT-E', 'DERE'],
        'IMOBILIARIO': ['IMÓVEL', 'IMOVEL', 'IMOBILI', 'LOCAÇÃO', 'LOCACAO', 'ALUGUEL'],
        'GERAL': ['REFORMA TRIBUTÁRIA', 'REFORMA TRIBUTARIA', 'SISTEMA TRIBUTÁRIO'],
        'TECNOLOGIA': ['API', 'PORTAL', 'CHATBOT', 'DIGITAL', 'SISTEMA'],
        'TRANSICAO': ['TRANSIÇÃO', 'TRANSICAO', 'ADAPTAÇÃO', 'ADAPTACAO'],
    }
    
    for tag, keywords in keyword_tags.items():
        if any(kw in text for kw in keywords):
            tags.append(tag)
    
    if not tags:
        tags.append('GERAL')
    
    return tags
