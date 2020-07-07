import { browser, element, by, ExpectedConditions} from 'protractor';
import { __values } from 'tslib';
import { async } from 'rxjs/internal/scheduler/async';
import { protractor } from 'protractor/built/ptor';
import { normalize } from 'path';
describe('OQ.ECCORE.001  User can able to login enterprise configurator', () => {
    browser.ignoreSynchronization = true;
    browser.manage().window().maximize();
    var originalTimeout;
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000000;
    });
    afterEach(function() {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

       it('Step#1 Sever is starting', async () => {
          const exec = require('child_process').exec; 
           exec('startServerScript.bat', (err, stdout, stderr) => {
            console.log("startServerScript err before if: ",err);
          if (err){
             console.log("startServerScript err: ",err);
             return;
          }
            console.log( "startServerScript stdout:",stdout);
            console.log("startServerScript stderr:",stderr);
        });
      })

       it('Step#2  Test manager can able to display Login page', async () => {
        await browser.get('');
        });
    
       it('Step#3  User can able to click the LDAP button', async () => {
        await element(by.name('ldap')).click();
       });
    
      it('Step#4 User should be able to login with LDAP for Enterprise Core', async()=>{
          await element(by.name("uname")).clear();
          await element(by.name("password")).clear();
          await element(by.name("uname")).sendKeys('esadmin1');
          await element(by.name("password")).sendKeys('user@123');
          await element(by.id("login-button")).click();
          // var loginButton = element(by.id("login-button"));
          // const EC =protractor.ExpectedConditions;
          //await waitForElement(element(by.id("login-button")),5000).click();
          browser.sleep(10000);
          //browser.wait(EC.presenceOf(loginButton), 5000,"Login Button Not Clicked");
          // browser.wait(await element(by.id("login-button")).click, 10000,"Login Button Not Clicked");
       })

    
      
      it('Step#5 User should be able to add Region', async()=>{
           await element(by.id("addRegion")).click();
           browser.sleep(3000);
          await element(by.css('select option:nth-child(2)')).click();
           await element(by.id('addname')).sendKeys("testing region");
           browser.sleep(1000);
           await element(by.id('addnotes')).sendKeys("testing region notes");
           browser.sleep(1000);
           await element(by.id("submitRegion")).click();
           browser.sleep(1000);
        })

     it('Step#6 User should be able to update Region name', async() =>{
          browser.sleep(3000)
          await element(by.xpath("/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[3]/li")).click(); 
          await element (by.id("name")).clear();
          await element (by.id("name")).sendKeys("updated region");
          await element(by.id("updateRegion")).click();
          //await element(by.xpath("/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[3]")).sendKeys("updated region");
          browser.sleep(3000)
        })

        it('Step#7 User should be able to delete Region', async() =>{
          //await element(by.xpath("/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/li")).click();
          //element(by.xpath[li{normalize-space()} = 'Mednet 2']
          // await element(by.xpath("//li[normalize-space()='testing region'].click()"));
          // browser.sleep(1000);
          // await element(by.xpath("//mat-icon[normalize-space()='testing region'].click()"));
          // browser.sleep(2000);
          await element(by.xpath("/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[3]/li")).click();
          browser.sleep(1000);
          await element(by.xpath("/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[3]/div/mat-icon[2]")).click();
          browser.sleep(1000);
        })
       

       it('Step#8 User should able to add facility in hierarchy', async()=>{
          await element(by.id("addRegion")).click();
          browser.sleep(3000);
          await element(by.css('select option:nth-child(5)')).click();
          browser.sleep(2000)
          await element(by.id("FacilityName")).sendKeys('testing facility');
          await element(by.id("AddressLine1")).sendKeys('testing AddressLine1');
          await element(by.id("City")).sendKeys('testing City');
          await element(by.id("AddressLine2")).sendKeys('testing AddressLine2');
          await element(by.id("State")).sendKeys('testing State');
          await element(by.id("AddressLine3")).sendKeys('testing AddressLine3');
          await element(by.id("PostalCode")).sendKeys('testing PostalCode');
          await element(by.id("Country")).sendKeys('testing Country');
          await element(by.id("addFacility")).click();
          browser.sleep(1000);
       })

      
       it('Step#9 Number of icon available in This page',() =>{
        var elementNo=element.all(by.id("pluginDetected"))
        elementNo.all(by.tagName("img")).count().then(function (value) {
        console.log("Icons available in this page",value);
        });
          browser.sleep(1000)
      })
     
      it('Step#10 User should be able to search specific facility' ,async()=>{
        await element(by.id("delete-element-btn")).click();
        browser.sleep(2000);
        await element(by.id("searchFacility")).click();
        await element(by.id("searchFacility")).sendKeys('testing facility');
        browser.sleep(2000);
        await element(by.id("closeFacility")).click();
      })

      it('Step#11 User should go to the setting page', async() =>{
        await element(by.xpath('/html/body/app-root/app-dashboard/app-header/div/div/div[4]/div/div/button[2]/span/mat-icon')).click();
        browser.sleep(2000);
      })
 
     it('Step#12 User should be able to add groups in setting page', async()=>{
      await element(by.xpath('/html/body/app-root/app-dashboard/app-settings/div/div/div[1]/form/div[2]/div[3]/div/div[3]/button[1]/span/mat-icon')).click();
      await element(by.xpath("/html/body/app-root/app-dashboard/app-settings/div/div/div[1]/form/div[2]/div[4]/div/div[1]/mat-form-field/div/div[1]/div/input")).clear();
      await element(by.xpath("/html/body/app-root/app-dashboard/app-settings/div/div/div[1]/form/div[2]/div[4]/div/div[1]/mat-form-field/div/div[1]/div/input")).sendKeys("test group");
      await element(by.id("groupUpdate")).click();
      browser.sleep(2000);
     })

    it("Step#13 User can go back from setting page to home page", async() =>{
    await element(by.id("homeIcon")).click();
      browser.sleep(1000)
    })

    it('Step#14 User should be able to see newly added group in dropdown list', async() =>{
        await element(by.id("addRegion")).click();
        await browser.sleep(2000);
        await element(by.id("groupsValue")).click();
        await browser.sleep(2000);
        await element(by.id("cancelRegion")).click();
        browser.sleep(2000);
    });

    it('Step#15 User should be able to delete newly added facility from hierarchy tree', async()=>{
      await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[3]/li')).click();
      await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[3]/div/mat-icon[2]')).click();
      browser.sleep(1000);
    })

    it('Step#16 User should be able to delete newly added group from setting page', async()=> {
      await element(by.xpath('/html/body/app-root/app-dashboard/app-header/div/div/div[4]/div/div/button[2]/span/mat-icon')).click();
      browser.sleep(2000);
      await element(by.xpath('/html/body/app-root/app-dashboard/app-settings/div/div/div[1]/form/div[2]/div[4]/div/div[3]/button[2]/span/mat-icon')).click();
      browser.sleep(1000)
      await element(by.id("groupUpdate")).click();
      browser.sleep(2000);
    })
  
    it('Step#17 User should be able to search specific groups from hierarchy Tree', async()=>{
      await element(by.id("homeIcon")).click();
      browser.sleep(1000)
      await element(by.id("facilitySearch")).click();
      await element(by.id("facilitySearch")).sendKeys('Kaiser');
      await browser.sleep(2000);
    })


    it("Step#18 User should be logout from this application", async()=>{
      await element(by.id('userButton')).click();
      browser.sleep(1000);
      await element(by.id('logoutButton')).click();
      browser.sleep(1000);
    })

    it("Step#19 server stop", async()=>{
      const exec = require('child_process').exec; 
          exec('stopServerScript.bat', (err, stdout, stderr) => {
            console.log("startServerScript err before if: ",err);
          if (err){
            console.log("stopServerScript err: ",err);
            return;
          }
      });
    })

    })