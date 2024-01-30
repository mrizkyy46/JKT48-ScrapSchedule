const Scrappey = require('scrappey-wrapper');
const fs = require('fs').promises;
const cheerio = require('cheerio');

const apiKey = 'YOUR_API_KEY'; // Replace with your Scrappey API key https://scrappey.com/
const scrappey = new Scrappey(apiKey);

const getSchedule = async () => {
    try {
        const createSession = await scrappey.createSession({
            "session": "test",
        });

        const session = createSession.session;

        const getResponse = await scrappey.get({
            session: session,
            url: 'https://jkt48.com/calendar/list?lang=id',
        });

        const $ = cheerio.load(getResponse.solution.response);

        const schedules = [];

        const linkNextMonth = $(".entry-schedule__header--after").find("a").attr('href');
        const linkNextMonthFull = `https://jkt48.com${linkNextMonth}`;

        const schedulesCurrentMonth = $('.entry-schedule__calendar > table a').map((index, element) => {
            let link = `https://jkt48.com${$(element).attr('href')}`;

            let schedule = {
                id: getScheduleId(link),
                day: $(element).closest('td').prev().text().trim(),
                show: $(element).text().trim(),
                link: link,
            };

            return schedule;
        }).get();

        await fs.writeFile('schedules.json', JSON.stringify(schedulesCurrentMonth, null, 2));
        console.log('Successfully written current month data to file');

        const schedulesNextMonth = await getScheduleNextMonth(linkNextMonthFull, session);
        await fs.writeFile('schedules-nextmonth.json', JSON.stringify(schedulesNextMonth, null, 2));
        console.log('Successfully written next month data to file');

        await scrappey.destroySession(session);
    } catch (error) {
        console.error(error);
    }
};

const getScheduleNextMonth = async (url, session) => {
    try {
        const getResponse = await scrappey.get({
            session: session,
            url: url,
        });

        const $ = cheerio.load(getResponse.solution.response);

        const schedules = [];

        $('.entry-schedule__calendar > table a').each((index, element) => {
            let link = `https://jkt48.com${$(element).attr('href')}`;

            let schedule = {
                id: getScheduleId(link),
                day: $(element).closest('td').prev().text().trim(),
                show: $(element).text().trim(),
                link: link,
            };

            schedules.push(schedule);
        });

        return schedules;
    } catch (error) {
        console.error(error);
        return [];
    }
};

const getScheduleId = (link) => {
    const linkParts = link.split('/');
    const typeEvent = linkParts[3] ?? '';
    let id = '';

    if (typeEvent === 'theater' || typeEvent === 'event') {
        const splitText = linkParts[linkParts.length - 1]?.split('?')[0] ?? '';
        id = `${typeEvent}_${splitText}`;
    } else if (typeEvent === 'calendar') {
        const year = linkParts[6] ?? '';
        const month = linkParts[8] ?? '';
        const day = linkParts[linkParts.length - 1]?.split('?')[0] ?? '';
        id = `${typeEvent}_${year}${month}${day}`;
    }

    return id;
};

getSchedule();
