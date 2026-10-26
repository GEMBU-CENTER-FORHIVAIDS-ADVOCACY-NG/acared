export interface Quote {
    text: string;
    author: string;
}

export const quotes: Quote[] = [
    {
        text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
        author: "Nelson Mandela",
    },
    {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
    },
    {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
    },
    {
        text: "In the middle of difficulty lies opportunity.",
        author: "Albert Einstein",
    },
    {
        text: "Healthcare is all about people. Every interaction matters.",
        author: "Unknown",
    },
    {
        text: "To be tested is good. The living water is brought forth only by digging.",
        author: "Nelson Mandela",
    },
    {
        text: "Where there is no hygiene, there is no health.",
        author: "Mahatma Gandhi",
    },
    {
        text: "Caring is the essence of nursing and healthcare.",
        author: "Unknown",
    },
    {
        text: "The art of healing comes from nature, not from the physician.",
        author: "Marcus Aurelius",
    },
    {
        text: "Every child deserves a future, every patient deserves care.",
        author: "Unknown",
    },
    {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill",
    },
    {
        text: "What we think, we become.",
        author: "Buddha",
    },
    {
        text: "Be the change that you wish to see in the world.",
        author: "Mahatma Gandhi",
    },
    {
        text: "Quality in healthcare is not an act, it is a habit.",
        author: "Aristotle",
    },
    {
        text: "Together we can make a difference, one patient at a time.",
        author: "Unknown",
    },
];

/**
 * Returns a random quote from the collection.
 * Uses a seed based on the current date to show a consistent quote per day.
 */
export function getDailyQuote(): Quote {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = seed % quotes.length;
    return quotes[index];
}
