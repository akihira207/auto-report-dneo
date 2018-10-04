const puppeteer = require('puppeteer'),
      fs        = require('fs'),
      path      = require('path');
let App = null;

/**
 * App Object.
 */
App = {

    /**
     * App state.
     */
    state: {
        headlessMode    : true,
        outputPath      : '',
        fileName        : '',
        url             : '',
        userId          : '',
        password        : '',
        myNameIs        : '',
        myDepartmentIs  : '',
        subject         : '',
        myNoticeToGroup : '',
        content         : '',
    },

    /**
     * initialize.
     */
    initialize: () => {
        let self            = App,
            reportDay       = new Date(),
            settingFilePath = path.join(__dirname, '../assets/config/setting.json'),
            repotFilePath   = path.join(__dirname, '../assets/template_file/report.txt'),
            json            = null;
        
        //
        // Setting File Loading...
        //
        json = self.readFile(settingFilePath, 'json');
        self.state.headlessMode    = json.headlessMode === 'true' ? true : false;
        self.state.outputPath      = 'capture/';
        self.state.fileName        = 'deploy_your_report.png';
        self.state.url             = json.url;
        self.state.userId          = json.userId;
        self.state.password        = json.password;
        self.state.myNameIs        = json.myNameIs;
        self.state.myDepartmentIs  = json.myDepartmentIs;
        self.state.myNoticeToGroup = json.myNoticeToGroup;

        //
        // Report File Loading...
        //
        self.state.content = self.readFile(repotFilePath, 'txt');

        //
        // Subject Generate.
        //
        self.state.subject = '【' + self.state.myDepartmentIs  + '】' + (reportDay.getMonth() + 1) + '月' + reportDay.getDate() + '日' + ' 業務報告：' + self.state.myNameIs;

        console.log('↓↓↓↓↓↓↓↓↓↓Your State Start↓↓↓↓↓↓↓↓↓↓');
        console.log('');
        console.log(self.state);
        console.log('');
        console.log('↑↑↑↑↑↑↑↑↑↑Your State End↑↑↑↑↑↑↑↑↑↑');
        
        return self;
    },

    /**
     * Read the contents of the file.
     * @param   {String} path
     * @param   {String} extension 
     * @returns {String} 
     */
    readFile: (path, extension) => {
        if (extension === 'json') {
            return JSON.parse(fs.readFileSync(path, 'utf8'));
        } else if (extension === 'txt') {
            return fs.readFileSync(path, 'utf8');
        }
    },

    /**
     * run puppeteer.
     */
    runPuppeteer: () => {
        let self = App;
        puppeteer.launch({
            headless: self.state.headlessMode,
            slowMo: 10,
            args: ['--no-sandbox']
        }).then(async browser => {
            const page = await browser.newPage();
            let noticeChoiceResult = null,
                isProgressReport   = false;
        
            //
            // Page Base Setting...
            //
            await page.setViewport({width: 1200, height: 800});
    
            //
            // Let's Go!!
            //
            await page.goto(App.state.url, 
                {
                    waitUntil: 'domcontentloaded'
                }
            );
        
            //
            // Login Screen.
            //
            await page.type('input[name="UserID"]', App.state.userId);
            await page.type('input[name="_word"]', App.state.password);
            await page.click('#login-btn');
            
        
            //
            // Your My Page Screen.
            //
            await page.waitFor(1500); // 1.0s failed.
            await page.click('a[href="zcreport.cgi?cmd=creportindex&log=on"]');
            
        
            //
            // Report Top Screen.
            // (SPA)
            //
            await page.waitFor(4000); // 2.5s failed.
            await page.click('#listfrm > div.co-actionwrap.top > div.co-actionarea > input.jco-list-add-page');
             
            //
            // Report Create Screen.
            //
            await page.waitFor(12000); // 7.0s failed.

            //
            // Confirm existence of report in progress
            //
            isProgressReport = await page.evaluate( () => {
                const selector = '#neodialog-confirm > div.ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix > div > button:nth-child(2)';
                if(document.querySelectorAll(selector).length) {
                    return true;
                }
                return false;
            });

            if (isProgressReport) {
                await page.click('#neodialog-confirm > div.ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix > div > button:nth-child(2)');
            }
            
            await page.type('input[name="subject"]', App.state.subject);
            await page.click('#jcreport-route-sel-items-area > span > a');
            await page.waitFor(200);
            await page.click('#jcreport-route-edittype-menu > li:nth-child(2) > a');
        
            //
            // Report Create Screen.
            // Popup => Notification Choice Screen.
            //
            await page.waitFor(3000); // 1.0s failed.
            noticeChoiceResult = await page.evaluate( App => {
                let i           = 0,
                    number      = 1,
                    result      = {
                        isError  : true,
                        errMsg   : '',
                        selector : null,
                    },
                    noticeGroup = document.querySelector('#jcreport-route-select-dialog > div > div.jcreport-data > div > table').rows;
        
                for (; i < noticeGroup.length; i++, number++) {
                    if (App.state.myNoticeToGroup === noticeGroup[i].lastElementChild.textContent) {
                        result.selector = '#jcreport-route-select-dialog > div > div.jcreport-data > div > table > tbody > tr:nth-child(' + number +') > td.co-chk > input[type="checkbox"]';
                        result.isError = false;
                        break;
                    }
                }
        
                if (result.isError) {
                    result.errMsg = '通知先リストに、' + App.state.myNoticeToGroup + 'が、見つかりません。';
                }
        
                return result;
        
            }, App);
        
            if (noticeChoiceResult.isError) {
                console.log(noticeChoiceResult.errMsg);
                browser.close();
            }
        
            await page.click(noticeChoiceResult.selector);
            await page.click('body > div.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.dn-dialog.ui-draggable > div.ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix > div > button:nth-child(1) > span');
            
            await page.waitFor(800);
            
            // If there is a change in the editor kit, it must be corrected. 
            await page.click('#creport-edit-editor > div > div > div > span > span:nth-child(2) > span:nth-child(10) > span:nth-child(2) > a');
            await page.type('#creport-edit-editor > div > div > div > div > textarea', App.state.content);
            await page.click('#inputfrm > div.co-actionwrap.bottom > div > input.jcreport-input-confirm');
        
            //
            // Report Confirm Screen.
            //
            await page.waitFor(3000);
            await page.screenshot(
                {
                    path: path.join(__dirname, App.state.outputPath + App.state.fileName),
                    fullPage: true
                }
            );

            // Send report.
            await page.click('#jcreport-m-confirm-page > div > div.co-actionwrap.bottom > div > input.jcreport-ok');
        
            // wait...
            await page.waitFor(1000);

            // Finish.
            browser.close();
            
        });
    }
};

//
// App Start.
//
App.initialize().runPuppeteer();
