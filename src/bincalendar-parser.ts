// TODO: change this parser according to your calendar

// TODO: parse date according to your calendar if necessary, otherwise
// remove this function
function parseDate(date: string): Date {
  //YYYYMMDDTHHMMSS
  const YYYY = Number(date.slice(0, 4));
  const MM = Number(date.slice(4, 6)) - 1;
  const DD = Number(date.slice(6, 8));
  return new Date(YYYY, MM, DD);
}

export type Reply = {
  date: Date;
  bins_count: Record<string, number>;
};

type Event = {
  dtstart: string,
  dtend: string,
  description: string,
  summary: string,
}

export function parseReply(calendar: any, bins: string[]): Reply {
  const events: Event[] = calendar['vcalendar'][0]['vevent'];
  const date: Date = new Date();
  const afterDates = Object.values(events).filter(function(d) {
    return parseDate(d.dtstart).getTime() - date.getTime() > 0;
  });

  afterDates.sort(function(a, b) {
    const distancea = Math.abs(parseDate(a.dtstart).getTime() - date.getTime());
    const distanceb = Math.abs(parseDate(b.dtstart).getTime() - date.getTime());
    return distancea - distanceb;
  });

  const bins_count: Record<string, number> = {};
  for (const i in bins) {
    const re = new RegExp(bins[i], 'g');
    bins_count[bins[i]] = (afterDates[0].summary.match(re) || []).length;
  }

  return {date: parseDate(afterDates[0].dtstart), bins_count: bins_count};
}
