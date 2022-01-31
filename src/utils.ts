// Генерирует квази уникальный 6-ти символьный идентификатор
export function genShortUid(): string {
    const a = 36; // 10 digit + 26 eng char
    const h = 46656; // a ^ 3;

    let quid = ((Math.random() * h) | 0).toString(a);
    quid += ((Math.random() * h) | 0).toString(a);
    return ('0000' + quid).slice(-6);
}

// Тасует массив (алгоритм Фишера-Йетса)
export function shuffle<T>(a: T[]): T[] {
    for (let i = a.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
}

// Получить значение css переменной
export function getStyleVar(prop: string): string {
    const cs = getComputedStyle(document.documentElement);
    return cs?.getPropertyValue('--' + prop) ?? '';
}

