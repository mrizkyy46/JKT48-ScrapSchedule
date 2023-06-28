const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

const getSchedule = async () => {
    try {
        const { data } = await axios.get('https://jkt48.com/calendar/list?lang=id');
        const $ = cheerio.load(data);
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

        await fs.writeFile('schedules.json', JSON.stringify(schedules, null, 2));
        console.log('Successfully written data to file');
    } catch (error) {
        console.error(error);
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



