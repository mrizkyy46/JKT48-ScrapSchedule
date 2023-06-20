const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

const getSchedule = async () => {
    try {
        const { data } = await axios.get('https://jkt48.com/calendar/list?lang=id');
        const $ = cheerio.load(data);
        const schedules = [];

        $('.entry-schedule__calendar > table a').each((_idx, el) => {
            const schedule = {
                day: $(el).closest('td').prev().text().trim(),
                show: $(el).text().trim(),
                link: `https://jkt48.com${$(el).attr('href')}`,
            };
            schedules.push(schedule);
        });

        await fs.writeFile('schedules.json', JSON.stringify(schedules, null, 2));
        console.log('Successfully written data to file');
    } catch (error) {
        console.error(error);
    }
};

getSchedule();
