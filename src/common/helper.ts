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

export const validAction = ['On', 'Off'];

export const validStatus = ['active', 'inactive', 'maintenance'];