export const parseDate = (value?: string): Date | undefined => {
    if (!value || value.trim() === "") return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
};
