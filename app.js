const puppeteer = require('puppeteer');
const fs = require("fs");
const { parse } = require("csv-parse");
const xlsreader = require("./readxls");

(async () => {


    // Read Xls file
    data = xlsreader.readFile()

    for(let i=0; i < data.length; i++){
        donorData = data[i]
    

        const browser = await puppeteer.launch({
            headless: false,
            slowMo: 150,
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            defaultViewport: null
        });
        const page = await browser.newPage();
        await page.goto('https://www.gubbachi.org.in/donate');
        //await page.screenshot({path: 'example.png'});
        console.log('Waiting for iframe to be loaded');
        const iframe = await waitForFrame(page);   
        await iframe.waitForSelector('#dm_rs_input_5720');
        const elementHandle = await page.$(
            'iframe[src="https://www-gubbachi-org-in.filesusr.com/html/36d8e8_654919906176421ba7fb5a7e28a3301b.html"]',
        );
        const frameHandle = await elementHandle.contentFrame();

        console.log('Filling form in iframe');
        await frameHandle.click('#dm_rs_input_5720'); 
        await frameHandle.type('#dm_rs_input_5720', (donorData.Amount).toString(), { delay: 100 });

        console.log('Click somewhere to reflect changes to page');
        const someelement = await frameHandle.$('#dm_rs_5720');
        await someelement.click();
        await delay(500);
        const amountTextBox = await frameHandle.$('#dm_rs_input_5720');
        console.log(await frameHandle.evaluate(x => x.value, someelement));
        await page.screenshot({path: 'example2.png'});

        // Click Donate now link
        const donateNowHref = await frameHandle.$('#donat_now_link');
        console.log('Clicking on iframe');
        await donateNowHref.click();

        //Once the form is loaded fill up the user details in form
        await frameHandle.waitForSelector('#donationinfo-fullname');
        await frameHandle.click('#donationinfo-fullname'); 
        await frameHandle.type('#donationinfo-fullname', donorData.Name, { delay: 50 });

        //Select Nationality as India
        await frameHandle.select('#donationinfo-nationality', donorData.Nationality)

        // Type address
        await frameHandle.waitForSelector('#donationinfo-address');
        await frameHandle.click('#donationinfo-address'); 
        await frameHandle.type('#donationinfo-address', donorData.Address, { delay: 10 });

        // Type pincode
        
        await frameHandle.waitForSelector('#donationinfo-pincode');
        await frameHandle.click('#donationinfo-pincode'); 
        await frameHandle.type('#donationinfo-pincode', (donorData.Pin).toString(), { delay: 50 });

        //Select Country - Is defaulted to Indi
        
        //await frameHandle.select('#donationinfo-country', 'India')
        //await delay(2000);


        //Type State
        
        await frameHandle.waitForSelector('#donationinfo-state');
        await frameHandle.click('#donationinfo-state'); 
        await frameHandle.type('#donationinfo-state', donorData.State, { delay: 50 });

        //Type City
        
        await frameHandle.waitForSelector('#donationinfo-city');
        await frameHandle.click('#donationinfo-city'); 
        await frameHandle.type('#donationinfo-city', donorData.City, { delay: 50 });

        //Type PAN
        
        await frameHandle.waitForSelector('#donationinfo-id');
        await frameHandle.click('#donationinfo-id'); 
        await frameHandle.type('#donationinfo-id', donorData.Pan, { delay: 50 });

        //Type email
        
        await frameHandle.waitForSelector('#donationinfo-email');
        await frameHandle.click('#donationinfo-email'); 
        await frameHandle.type('#donationinfo-email', donorData.Email, { delay: 50 });


        //Type mobile number
        
        await frameHandle.waitForSelector('#donationinfo-mobile');
        await frameHandle.click('#donationinfo-mobile'); 
        await frameHandle.type('#donationinfo-mobile', (donorData.Mobile).toString(), { delay: 50 });


        //Click on donate now button
        
        const donateNowButton = await frameHandle.$('button.donateNowbtn');
        await donateNowButton.click();

        await delay(500);
        
        
        await frameHandle.waitForSelector('#bank_transfer');
        const bankTransferButton = await frameHandle.$('#bank_transfer');
        await bankTransferButton.click(); 
    

        // Wait for donationinfo-trackingnumber
        await frameHandle.waitForSelector('#donationinfo-trackingnumber');
        await frameHandle.click('#donationinfo-trackingnumber'); 
        await frameHandle.type('#donationinfo-trackingnumber', (donorData.Transaction).toString(), { delay: 100 });


        // Submit payment 
        await frameHandle.waitForSelector('#payment_sbmt_btn');
        const paymentSubmitButton = await frameHandle.$('#payment_sbmt_btn');
        await paymentSubmitButton.click(); 
        
        
        // Wait for confirmation msg 
        await frameHandle.waitForSelector('#confirmation_message > .dm-font-color');
        const donationRefNumber = await frameHandle.$('#confirmation_message > .dm-font-color');
        console.log(await frameHandle.evaluate(x => x.innerText, donationRefNumber));

        await page.screenshot({path: 'example3.png'});
        await delay(2000);


        await browser.close();

    }
})();

function waitForFrame(page) {
    let fulfill;
    const promise = new Promise(x => fulfill = x);
    checkFrame();
    return promise;
  
    function checkFrame() {
      const frame = page.frames().find(f => f.name() === 'htmlComp-iframe');
      if (frame)
        fulfill(frame);
      else
        page.once('frameattached', checkFrame);
    }
  }

  const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));


  function readInput(){
    fs.createReadStream("./input_data.csv")
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row) {
        console.log(row);
    })
    .on("end", function () {
        console.log("finished");
    })
    .on("error", function (error) {
        console.log(error.message);
    });
  }
