const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

const getSchedule = async () => {
    try {
        const { data } = await axios.get('https://jkt48.com/calendar/list?lang=id');
        const $ = cheerio.load(data);
        const schedules = [];

        $('.entry-schedule__calendar > table a').each((index, element) => {
            let schedule = {
                day: $(element).closest('td').prev().text().trim(),
                show: $(element).text().trim(),
                link: `https://jkt48.com${$(element).attr('href')}`,
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
