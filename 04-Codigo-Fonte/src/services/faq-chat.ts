import { getChatbotKnowledgeBase, type ChatKnowledgeEntry } from '@/services/chatbot-knowledge';

export type FAQChatSource = {
    id: string;
    question: string;
    source: string;
    source_url?: string;
    source_type: string;
    score: number;
};

export type FAQChatResponse = {
    answer: string;
    can_answer: boolean;
    source?: FAQChatSource;
    reason: 'FOUND' | 'NOT_FOUND' | 'EMPTY_QUESTION';
};

const STOP_WORDS = new Set([
    'a', 'o', 'as', 'os', 'de', 'da', 'do', 'das', 'dos', 'e', 'ou', 'com', 'sem', 'para', 'por', 'em',
    'no', 'na', 'nos', 'nas', 'um', 'uma', 'uns', 'umas', 'que', 'se', 'ser', 'sao', 'são', 'como', 'qual',
    'quais', 'quando', 'onde', 'sobre', 'ter', 'tem', 'já', 'ja', 'vai', 'vou', 'ao', 'aos', 'à', 'às',
    'partir', 'mais', 'menos', 'toda', 'todo', 'todas', 'todos', 'isso', 'esta', 'esse', 'essa', 'sistema',
    'atlas', 'dentro', 'proprio', 'próprio'
]);

function normalize(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function tokenize(value: string): string[] {
    return normalize(value)
        .split(' ')
        .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function scoreEntry(tokens: string[], normalizedQuestion: string, entry: ChatKnowledgeEntry): {
    score: number;
    matched: number;
    strongMatched: number;
} {
    if (tokens.length === 0) return { score: 0, matched: 0, strongMatched: 0 };

    const questionNorm = normalize(entry.question);
    const answerNorm = normalize(entry.answer);
    const tagsNorm = normalize((entry.tags || []).join(' '));
    const keywordsNorm = normalize((entry.keywords || []).join(' '));

    let score = 0;
    let matched = 0;
    let strongMatched = 0;

    for (const token of tokens) {
        let localMatch = false;
        let localStrong = false;

        if (questionNorm.split(' ').includes(token)) {
            score += 6;
            localMatch = true;
            localStrong = true;
        } else if (questionNorm.includes(token)) {
            score += 4.5;
            localMatch = true;
            localStrong = true;
        }

        if (keywordsNorm.includes(token)) {
            score += 3.5;
            localMatch = true;
            localStrong = true;
        }

        if (tagsNorm.includes(token)) {
            score += 3;
            localMatch = true;
            localStrong = true;
        }

        if (answerNorm.includes(token)) {
            score += 1.6;
            localMatch = true;
        }

        if (localMatch) matched += 1;
        if (localStrong) strongMatched += 1;
    }

    if (matched >= 2) score += 2;
    if (matched >= 4) score += 3;

    const longQuestion = questionNorm.length >= 20;
    if (longQuestion && normalizedQuestion.includes(questionNorm.slice(0, Math.min(42, questionNorm.length)))) {
        score += 3;
    }

    score += Math.min(2, (entry.priority || 0) * 0.4);

    return { score, matched, strongMatched };
}

export async function answerFAQQuestion(question: string): Promise<FAQChatResponse> {
    const trimmed = question.trim();
    if (!trimmed) {
        return {
            answer: 'Envie uma pergunta para iniciar a consulta.',
            can_answer: false,
            reason: 'EMPTY_QUESTION',
        };
    }

    const normalizedQuestion = normalize(trimmed);
    const tokens = tokenize(trimmed);
    const knowledgeBase = await getChatbotKnowledgeBase();

    const ranked = knowledgeBase
        .map((entry) => {
            const scored = scoreEntry(tokens, normalizedQuestion, entry);
            return {
                entry,
                score: scored.score,
                matched: scored.matched,
                strongMatched: scored.strongMatched,
            };
        })
        .sort((a, b) => b.score - a.score);

    const best = ranked[0];
    const minScore = tokens.length <= 2 ? 6.5 : 8;
    const minimumMatchedTokens = Math.max(1, Math.ceil(tokens.length * 0.4));
    const minimumStrongMatches = tokens.length >= 3 ? 2 : 1;

    const groundedRanked = ranked.filter((item) =>
        item.score >= minScore &&
        item.matched >= minimumMatchedTokens &&
        item.strongMatched >= minimumStrongMatches
    );

    const groundedBest = groundedRanked[0];
    const groundedSecond = groundedRanked[1];

    const hasSignal = Boolean(groundedBest);
    const hasConfidenceGap =
        !groundedSecond ||
        groundedBest.score - groundedSecond.score >= 0.5 ||
        groundedBest.score >= minScore + 4;

    if (!hasSignal || !hasConfidenceGap) {
        return {
            answer: 'Não encontrei informação no sistema para responder com segurança. Para análise individual, procure advogado especialista. Este sistema foi criado e desenvolvido por advogada tributarista com curadoria da advogada Brenda Ibiapina OAB/DF 83.671. Atendimento no Instagram @brendaibiapina: https://instagram.com/brendaibiapina.',
            can_answer: false,
            reason: 'NOT_FOUND',
        };
    }

    return {
        answer: groundedBest.entry.answer,
        can_answer: true,
        reason: 'FOUND',
        source: {
            id: groundedBest.entry.id,
            question: groundedBest.entry.question,
            source: groundedBest.entry.source_label,
            source_url: groundedBest.entry.source_url,
            source_type: groundedBest.entry.source_type,
            score: Number(groundedBest.score.toFixed(2)),
        },
    };
}
