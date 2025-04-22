export function isValidUUID(uuid: string): boolean {
    const mssqlUUIDRegex = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/;
    return mssqlUUIDRegex.test(uuid);
}

export function isValidDateFormat(dateStr: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;  // YYYY-MM-DD
    const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/; // YYYY-MM-DD HH:mm
    const timeRegex = /^\d{2}:\d{2}$/; // HH:mm

    return dateRegex.test(dateStr) || dateTimeRegex.test(dateStr) || timeRegex.test(dateStr);
}

export const validRepeat = ["daily", "weekly", "monthly", "x days"]
export function isValidTimeOfDaily(dateStr: string): boolean {
    const timeRegex = /^\d{2}:\d{2}$/; // HH:mm
    return timeRegex.test(dateStr);
}

const validTimeOfWeekly = ["mon", "tue", "wed", "thur", "fri","sat", "sun"]
export function isValidTimeOfWeekly(dateStr: string): boolean {
    const timeRegex = new RegExp (`^(${validTimeOfWeekly.join("|")}) \\d{2}:\\d{2}$`); // dayInWeek HH:mm
    return timeRegex.test(dateStr);
}

export function isValidTimeOfMonthly(dateStr: string): boolean {
    const timeRegex = /^(0?[1-9]|[1-2][0-9]|30) \d{2}:\d{2}$/; // number HH:mm
    return timeRegex.test(dateStr);
}

export function isValidXDaysFormat(input: string): boolean {
    const regex = /^(0?[1-9]|[1-9][0-9]) \d{2}:\d{2}$/;
    return regex.test(input);
}



export const validAction = ['On', 'Off'];

export const validStatus = ['Manual', 'Auto', 'Manual Only'];