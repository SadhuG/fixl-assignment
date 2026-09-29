const dateFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export const formatDate = (iso: string) => dateFormat.format(new Date(iso));
