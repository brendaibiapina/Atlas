# Modelo de Dados — Atlas da Reforma Tributária

## 1. Entidades Principais

### `Source` (Fonte Oficial)
Representa a origem da informação. Garantia de rastreabilidade.
*   **id**: UUID
*   **name**: String (Ex: "DOU", "Portal RFB", "Câmara dos Deputados")
*   **url_base**: String
*   **trust_level**: Enum (OFFICIAL, NEWS, UNOFFICIAL) - *Atlas só usa OFFICIAL*

### `LegalReference` (Ato Normativo)
O documento ou publicação em si.
*   **id**: UUID
*   **source_id**: FK -> Source
*   **title**: String (Ex: "Lei Complementar nº 214/2025")
*   **publication_date**: Date
*   **url_official**: String (Link direto)
*   **document_type**: String (Lei, Ato, Nota Técnica, Orientação)
*   **status**: Enum (VIGENTE, REVOGADO, EM_VACANCIA)

### `Event` (Evento na Timeline)
Um marco temporal derivado de uma referência legal.
*   **id**: UUID
*   **reference_id**: FK -> LegalReference
*   **description**: String (Ex: "Início da vigência do IBS")
*   **event_date**: Date (Pode ser null se depender de gatilho)
*   **is_milestone**: Boolean (Se aparece na home)
*   **trigger_condition**: String (Ex: "30 dias após publ. Regulamento X")
*   **status**: Enum (CONFIRMADO, ESTIMADO, ATRASADO)

### `Obligation` (Obrigação Acessória)
Item acionável para o contador/advogado.
*   **id**: UUID
*   **reference_id**: FK -> LegalReference
*   **title**: String (Ex: "Emitir NF-e com destaque IBS/CBS")
*   **description**: Text
*   **start_date**: Date
*   **end_date**: Date (Opcional)
*   **audience**: Array<Enum> (CONTADOR, ADVOGADO, IMOBILIARIO, TODOS)
*   **tax_type**: Enum (IBS, CBS, IS, ITBI, OUTROS)
*   **compliance_status**: Enum (OBRIGATORIO, EDUCATIVO, EM_CONSTRUCAO, FUTURO)
*   **penalty_grace_period_end**: Date (Fim do período sem multa)

### `UserPreferences` (Preferências)
*   **user_id**: UUID
*   **persona**: Enum (CONTADOR, ADVOGADO, IMOBILIARIO)
*   **alert_frequency**: Enum (IMMEDIATE, DAILY, WEEKLY)
*   **compulsory_topics**: Array<String> (Tags obrigatórias)

---

## 2. Esquema SQL (Simplificado)

```sql
CREATE TABLE sources (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    url_base VARCHAR(255)
);

CREATE TABLE legal_references (
    id UUID PRIMARY KEY,
    source_id UUID REFERENCES sources(id),
    title VARCHAR(255) NOT NULL,
    publication_date DATE NOT NULL,
    url_official VARCHAR(500) NOT NULL,
    status VARCHAR(20) DEFAULT 'VIGENTE'
);

CREATE TABLE obligations (
    id UUID PRIMARY KEY,
    reference_id UUID REFERENCES legal_references(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE,
    compliance_status VARCHAR(20) CHECK (compliance_status IN ('OBRIGATORIO', 'EDUCATIVO', 'EM_CONSTRUCAO', 'FUTURO')),
    penalty_grace_period_end DATE,
    audience VARCHAR(50)[] -- Ex: {'CONTADOR', 'IMOBILIARIO'}
);

CREATE TABLE alerts (
    id UUID PRIMARY KEY,
    title VARCHAR(200),
    body TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    trigger_event_id UUID REFERENCES events(id)
);
```
