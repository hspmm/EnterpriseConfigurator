import { browser, element, by, ExpectedConditions, Key} from 'protractor';
import { __values } from 'tslib';
import { protractor } from 'protractor/built/ptor';
import {URL} from './ec-url';
var Request = require("request");

describe('OQ.ECCORE.001  UI Testing of enterprise configurator', () => {

    browser.ignoreSynchronization = true;
    browser.manage().window().maximize();
    var originalTimeout;
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000000;
    });
    afterEach(function() {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it("TID-ES-001-001 User should be able to access with the following internet browsers @chrome", async () => {
        await browser.get('');
        browser.sleep(5000)
    });

    it("TID-ES-001-002 User should be able to access URL with the SSL communication(https://Ip Address:4200)", async () => {
        await browser.get('https://localhost:4200/');
        browser.sleep(2000)
    });

    it("TID-ES-001-003 User should be able to access URL without the SSL communication", async () => {
        await browser.get('http://localhost:4200/');
        browser.sleep(10000)
    });

    it("TID-ES-001-005 Admin should be able to login in Enterprise application", async () => {
        await element(by.id('userName')).click();
        browser.sleep(2000)
    });
   
    it("TID-ES-001-006 User name field should be accept upto 100 Character", async () => {
        await element(by.name('uname')).clear();
        await element(by.name('uname')).sendKeys("qwertyuioplkjhgfdsazxcvbnmqwertyuioplkjhgfdsaxcvbnmqwertyopqwqwertyuioplkjhgfdsazxcvbnmqwertyuioplkjhgfdsaxcvbnmqwertyopqw");
        browser.sleep(2000)
    });

    it("TID-ES-001-007 User name field should be accept any alphanumeric Character", async () => {
        await element(by.name('uname')).clear();
        await element(by.name('uname')).sendKeys("Saritasingh@$%");
        browser.sleep(2000)
    });

    it("TID-ES-001-008 Password fied Character should be hidden while writingr", async () => {
        await element(by.name('password')).clear();
        await element(by.name('password')).sendKeys("Saritasingh12345");
        browser.sleep(2000)
    });

    it("TID-ES-001-009 Password should be visible with clicking the hawk key", async () => {
        var dcButton= element(by.id('hawkKey'))
        browser.actions().mouseDown(dcButton).perform();
        browser.sleep(5000);
        browser.actions().mouseUp(dcButton).perform();
    });

    it("TID-ES-001-010 Password should not be visible without clickling the hawk eye ", async () => {
        await element(by.name('password')).clear();
        await element(by.name('password')).sendKeys("Saritasingh12345");
        browser.sleep(2000)
    });

    it("TID-ES-001-011 Login with valid user name and invalid password ", async () => {
        await element(by.name('uname')).clear();
        await element(by.name('uname')).sendKeys("Admin");
        await element(by.name('password')).clear();
        await element(by.name('password')).sendKeys("Saritasingh12345");
        await element(by.name('loginbutton')).click();
        browser.sleep(6000)
    });

    it("TID-ES-001-012 Login with invalid user name and valid password", async () => {
        await element(by.name('uname')).clear();
        await element(by.name('uname')).sendKeys("Saritasingh123");
        await element(by.name('password')).clear();
        await element(by.name('password')).sendKeys("Icumed@1");
        await element(by.name('loginbutton')).click()
        browser.sleep(6000)
    });

    it("TID-ES-001-013 Login by invalid username and password ", async () => {
        await element(by.name('uname')).clear();
        await element(by.name('uname')).sendKeys("Saritasingh123");
        await element(by.name('password')).clear();
        await element(by.name('password')).sendKeys("Icumed@123");
        await element(by.name('loginbutton')).click()
        browser.sleep(6000)
    });

    it("TID-ES-001-014 Login by empty username and valid password", async () => {
        await element(by.name('uname')).clear();
        await element(by.name('password')).clear();
        await element(by.name('password')).sendKeys("Sarita@123");
       //await element(by.name('loginbutton')).click()
        browser.sleep(6000)
    });
    
    it("TID-ES-001-015 Login button should not be visible with valid username and empty password", async () => {
        await element(by.name('uname')).clear();
        await element(by.name('uname')).sendKeys("Admin");
        await element(by.name('password')).clear();
        browser.sleep(2000)
        //await element(by.name('password')).click();
        await element(by.name('loginbutton')).click()
        // browser.sleep(2000)
        // element(by.id("mat-error-1")).getText().then((value)=>{
        //     console.log("----",value);
        //     expect(value).toEqual("Password can't be empty");
        // })
    });
   
    it("TID-ES-001-016 Login button should not be visible with valid username and empty password", async () => {
        await element(by.name('uname')).clear();
        browser.sleep(2000)
        await element(by.name('password')).clear();
    });

    it("TID-ES-001-017 User should be able to login of the EC-Core with correct credentials maped in ISAS", async () => {
        await element(by.name('uname')).clear();
        await element(by.name('uname')).sendKeys("Admin");
        browser.sleep(2000)
        await element(by.name('password')).clear();
        await element(by.name('password')).sendKeys("Icumed@1");
        browser.sleep(2000)
        await element(by.name('loginbutton')).click()
        browser.sleep(10000)
    })

    it("TID-ES-001-022 Setting Icon should be in present and clickable  in the dashboard ", async () => {
        await element(by.id('settingsPageButton')).click();
        //await element(by.xpath('/html/body/app-root/app-dashboard/app-header/div/div/div[4]/div/div/button[2]/span/mat-icon')).click();
        browser.sleep(4000)
    });

    it("TID-ES-001-023 ISAS Plugin icon should be present and clickable", async () => {
        await element(by.id('homePageButton')).click();
        browser.sleep(2000)
        await element(by.id('goToSingleInstancePlugin')).click();
        browser.sleep(5000)
    });

    it("TID-ES-001-024 Current UserID should be shown and clickable ", async () => {
        await element(by.id('userButton')).click();
        browser.sleep(2000)
    });

     it("TID-ES-001-025 Current UesrID dropdown should be accessible", async () => {
        //browser.actions().mouseMove(element(by.id('pluginStatus'))).perform()
        browser.actions().mouseMove(element(by.id('pluginStatusPageButton'))).perform()
        browser.actions().mouseMove(element(by.id('logoutButton'))).perform()
        browser.sleep(2000)
    });

    it("TID-ES-001-026 Plugin status in Under Current UserID should be clickable", async () => {
        await element(by.id('pluginStatusPageButton')).click();
        //browser.actions().mouseMove(element(by.xpath('/html/body/div[1]/div[2]/div/div/div/button[1]/mat-icon'))).perform()
        browser.sleep(2000)
    });

    it("TID-ES-001-027 In Plugin status some default plugin should be available", async () => {
         //browser.actions().mouseMove(element(by.id('pluginStatus'))).perform()
        await element(by.id('enableDisabledPlugin')).click()
        browser.sleep(2000)
    });

    it("TID-ES-001-028 In New Page of Plugin status should show the details of all plugin", async () => {
        //browser.actions().mouseMove(element(by.id(' plugin_status'))).perform()
        browser.actions().mouseMove(element(by.id('plugin_status '))).perform()
        browser.sleep(2000)
    });

    it("TID-ES-001-029 In all plugin some default plugin should be available,That Service status should be enable", async () => {
        browser.actions().mouseMove(element(by.id('enableDisabledPlugin'))).perform()
        browser.sleep(2000)
    });

    it("TID-ES-001-030 For default plugin service status should not be change", async () => {
        browser.actions().mouseMove(element(by.id('enableDisabledPlugin'))).perform()
        browser.sleep(2000)
    });

    it("TID-ES-001-031 Specific Plugin should be able to restart", async () => {
        await element(by.xpath('/html/body/app-root/app-dashboard/app-about/div/table/tbody/tr[2]/td[7]/button')).click();
        browser.sleep(2000)
    });

    it("TID-ES-001-032 Other than default plugin admin should be able to change status for all plugin", async () => {
        await element(by.id('enableDisabledPlugin')).click();
        browser.sleep(2000)
    });

    it("TID-ES-001-033 After restart the Enterprise, all plugin should be able to start automatically", async () => {
        await element(by.id('restartPlugin')).click();
        browser.sleep(2000)
    });

    it("TID-ES-001-034 Without any further click current user option should be visible", async () => {
        await element(by.id('userButton')).click();
        browser.actions().mouseMove(element(by.id('pluginStatusPageButton'))).perform()
        browser.sleep(2000)
    });

    it("TID-ES-001-035 By clicking anywhere on window current user option should be invisible", async () => {
        await element(by.xpath('//*[@id="cdk-overlay-1"]/div/div/p')).click();
          browser.sleep(2000)
    });
    
    it("TID-ES-001-036 Admin should be able to go to the home page", async () => {
         await element(by.id('homePageButton')).click();
        //await element(by.xpath('/html/body/app-root/app-dashboard/app-header/div/div/div[4]/div/div/button[1]/span/mat-icon')).click();
        browser.sleep(2000)
    });

    it("TID-ES-001-037 Root node in Enterprise hierarchy must be there", async () => {
        await element(by.id('parent-1')).click();
        //await element(by.xpath('/html/body/app-root/app-dashboard/app-header/div/div/div[4]/div/div/button[1]/span/mat-icon')).click();
        browser.sleep(2000)
    });

    it("TID-ES-001-038 Expand/collapse button should be visible on root node", async () => {
        //await element(by.id('child-1')).click();
        await element(by.id('expandColapseHierarchyTreeNode')).click();
        browser.sleep(2000)
         await element(by.id('expandColapseHierarchyTreeNode')).click();
        // // await element(by.id('deleteNodeFromHierarchyTree')).click();
        browser.sleep(2000)
    });
 
    it("TID-ES-001-039 After clicking the node from hierarchy add button should be visible", async () => {
        await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/li')).click();
        browser.sleep(2000)
        browser.actions().mouseMove(element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/div/mat-icon[2]'))).perform()
        browser.sleep(2000)
    });

    it("TID-ES-001-040 After clicking the node from hierarchy add button icon should be there", async () => {   
        await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/li')).click();
        browser.sleep(2000)
        browser.actions().mouseMove(element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/div/mat-icon[2]'))).perform()
        browser.sleep(2000)
    });
   
    it("TID-ES-001-041 After clicking the node from hierarchy with mouse hover add button should be green color", async () => {
        await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/li')).click();
        browser.sleep(2000)
        browser.actions().mouseMove(element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/div/mat-icon[2]'))).perform()
        browser.sleep(2000)
    });

    it("TID-ES-001-042 After clicking the node from hierarchy with mouse hover on add icon word(add) should be visible", async () => {
        await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/li')).click();
        browser.sleep(2000)
        browser.actions().mouseMove(element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/div/mat-icon[2]'))).perform()
        browser.sleep(2000)
    });

    it("TID-ES-001-043 After clicking the node from hierarchy delete button should be there", async () => {
        // await element(by.id('parent-1')).click();
        // browser.sleep(2000)
        browser.actions().mouseMove(await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/div/mat-icon[3]'))).perform()
        browser.sleep(2000)
    });
    
    it("TID-ES-001-044 After clicking the node from hierarchy delete button icon should be there", async () => {
        await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/li')).click();
        browser.sleep(2000)
        browser.actions().mouseMove(element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/div/mat-icon[3]'))).perform()
        browser.sleep(2000)
    });
    
    it("TID-ES-001-045 After clicking the node from hierarchy with mouse hover delete button should be red color", async () => {
        await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/li')).click();
        browser.sleep(2000)
        browser.actions().mouseMove(element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/div/mat-icon[3]'))).perform()
        browser.sleep(2000)
    });

    it("TID-ES-001-046 After clicking the node from hierarchy with mouse hover on delete icon word(delete) should be visible", async () => {
        await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/li')).click();
        browser.sleep(2000)
        browser.actions().mouseMove(element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/div/mat-icon[3]'))).perform()
        browser.sleep(2000)
    });

    it("TID-ES-001-054 For add any node should be show a popup window with add an element page", async () => {
        await element(by.id('parent-1')).click();
        await element(by.id('addNodeToHierarchyTree')).click();
        browser.sleep(2000)
        await element(by.id('cancelRegion')).click();
        
    });
   
    it("TID-ES-001-055 Type of service label available on this popup window", async () => {
        await element(by.id('parent-1')).click();
        await element(by.id('addNodeToHierarchyTree')).click();
        browser.sleep(2000)
        browser.actions().mouseMove(element(by.id('groupsValue'))).perform()
        browser.sleep(2000)
        await element(by.id('cancelRegion')).click();
    });

    xit("TID-ES-001-056 Type of service is a dropdown control", async () => {
        await element(by.id('parent-1')).click();
        await browser.sleep(2000)
        await element(by.id('addNodeToHierarchyTree')).click();
        await browser.sleep(2000)
        await element(by.xpath('/html/body/div[1]/div[2]/div/mat-dialog-container/app-add-element/div[1]/div[1]/mat-form-field/div/div[1]/div[3]/mat-select')).click();
        browser.sleep(2000);
        await element(by.id('cancelRegion')).click();
    });

    xit("TID-ES-001-057 Value is coming in type of service from setting page", async () => {
        await element(by.id('parent-1')).click();
        await element(by.id('addNodeToHierarchyTree')).click();
        await browser.sleep(2000)
        await element(by.xpath('/html/body/div[2]/div[2]/div/mat-dialog-container/app-add-element/div[1]/div[1]/mat-form-field/div/div[1]/div[3]/mat-select/div/div[2]/div')).click();
        await browser.sleep(2000);
        await browser.actions().mouseMove(element(by.xpath('/html/body/div[2]/div[4]/div/div/div/mat-option[2]/span'))).perform()
        await browser.sleep(2000)
        await element(by.id('cancelRegion')).click();
    });

    it("TID-ES-001-058 According to type of service one label name should be change in add an element page", async () => {
        await element(by.id('parent-1')).click();
        await element(by.id('addNodeToHierarchyTree')).click();
        browser.sleep(2000)
        await element(by.xpath('/html/body/div[1]/div[2]/div/mat-dialog-container/app-add-element/div[1]/div[1]/mat-form-field/div/div[1]/div[3]/mat-select')).click();
        browser.sleep(2000);
        await element(by.xpath('/html/body/div[1]/div[4]/div/div/div/mat-option[2]')).click();
        browser.sleep(2000)
        await element(by.id('addname')).click();
        browser.sleep(2000)
        await element(by.id('cancelRegion')).click();
    });
    
    it("TID-ES-001-059 Another label name should be fix for any type of service", async () => {
        await element(by.id('parent-1')).click();
        await element(by.id('addNodeToHierarchyTree')).click();
        browser.sleep(2000)
        await element(by.xpath('/html/body/div[1]/div[2]/div/mat-dialog-container/app-add-element/div[1]/div[1]/mat-form-field/div/div[1]/div[3]/mat-select')).click();
        browser.sleep(2000);
        await element(by.xpath('/html/body/div[1]/div[4]/div/div/div/mat-option[2]')).click();
        browser.sleep(2000)
        await element(by.id('addname')).click();
        await element(by.id('addnotes')).click(); 
        browser.sleep(2000)
        await element(by.id('cancelRegion')).click();
    });
    
    it("TID-ES-001-060 Node name field should be accept any alphanumeric Character", async () => {
        await element(by.id('parent-1')).click();
        await element(by.id('addNodeToHierarchyTree')).click();
        browser.sleep(2000)
        await element(by.xpath('/html/body/div[1]/div[2]/div/mat-dialog-container/app-add-element/div[1]/div[1]/mat-form-field/div/div[1]/div[3]/mat-select')).click();
        browser.sleep(2000);
        await element(by.xpath('/html/body/div[1]/div[4]/div/div/div/mat-option[2]')).click();
        browser.sleep(2000)
        await element(by.id('addname')).click();
        await element(by.id('addname')).sendKeys("testing node@#$^%$");
        await element(by.id('addnotes')).click(); 
        browser.sleep(2000)
        await element(by.id('cancelRegion')).click();
    });
    
    it("TID-ES-001-061 Node name field should be accept any alphanumeric Characterr", async () => {
        await element(by.id('parent-1')).click();
        await element(by.id('addNodeToHierarchyTree')).click();
        browser.sleep(2000)
        await element(by.xpath('/html/body/div[1]/div[2]/div/mat-dialog-container/app-add-element/div[1]/div[1]/mat-form-field/div/div[1]/div[3]/mat-select')).click();
        browser.sleep(2000);
        await element(by.xpath('/html/body/div[1]/div[4]/div/div/div/mat-option[2]')).click();
        browser.sleep(2000)
        await element(by.id('addname')).click();
        await element(by.id('addname')).sendKeys("number node12345");
        await element(by.id('addnotes')).click(); 
        browser.sleep(2000)
        await element(by.id('cancelRegion')).click();
    });

    it("TID-ES-001-062 Node name field should be accept upto 100 Character", async () => {
        await element(by.id('parent-1')).click();
        await element(by.id('addNodeToHierarchyTree')).click();
        browser.sleep(2000)
        await element(by.xpath('/html/body/div[1]/div[2]/div/mat-dialog-container/app-add-element/div[1]/div[1]/mat-form-field/div/div[1]/div[3]/mat-select')).click();
        browser.sleep(2000);
        await element(by.xpath('/html/body/div[1]/div[4]/div/div/div/mat-option[2]')).click();
        browser.sleep(2000)
        await element(by.id('addname')).click();
        await element(by.id('addname')).sendKeys("dsfeledjfrweiourppppppppprwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww");
        await element(by.id('addnotes')).click(); 
        browser.sleep(2000)
        await element(by.id('cancelRegion')).click();
    });

    it("TID-ES-001-063 Notes field should be accept upto 250 Character", async () => {
       await element(by.id('parent-1')).click();
        await element(by.id('addNodeToHierarchyTree')).click();
        browser.sleep(2000)
        await element(by.xpath('/html/body/div[1]/div[2]/div/mat-dialog-container/app-add-element/div[1]/div[1]/mat-form-field/div/div[1]/div[3]/mat-select')).click();
        browser.sleep(2000);
        await element(by.xpath('/html/body/div[1]/div[4]/div/div/div/mat-option[2]')).click();
        browser.sleep(2000)
        await element(by.id('addname')).click();
        await element(by.id('addname')).sendKeys("djeokur9wweheojkkkkkkkkkkkkjkgggggggggggggggggggggggggggggggiyuhyyyyyydwwwwwwwwwwwsjjjsfnddddddddddddddnllfjjjjjfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
        await element(by.id('addnotes')).click();
        browser.sleep(2000);
        await element(by.id('cancelRegion')).click();
    })

    it("TID-ES-001-064 Node name start point should not be space bar", async () => {
        await element(by.id('parent-1')).click();
        await element(by.id('addNodeToHierarchyTree')).click();
        browser.sleep(2000)
        await element(by.xpath('/html/body/div[1]/div[2]/div/mat-dialog-container/app-add-element/div[1]/div[1]/mat-form-field/div/div[1]/div[3]/mat-select')).click();
        browser.sleep(2000);
        await element(by.xpath('/html/body/div[1]/div[4]/div/div/div/mat-option[2]')).click();
        browser.sleep(2000)
        await element(by.id('addname')).click();
        await element(by.id('addname')).sendKeys("   Starting space");
        await element(by.id('addnotes')).click();
        browser.sleep(2000);
        await element(by.id('cancelRegion')).click();
    })

    it("TID-ES-001-065 Node name accept any space after any character", async () => {
        await element(by.id('parent-1')).click();
        await element(by.id('addNodeToHierarchyTree')).click();
        browser.sleep(2000)
        await element(by.xpath('/html/body/div[1]/div[2]/div/mat-dialog-container/app-add-element/div[1]/div[1]/mat-form-field/div/div[1]/div[3]/mat-select')).click();
        browser.sleep(2000);
        await element(by.xpath('/html/body/div[1]/div[4]/div/div/div/mat-option[2]')).click();
        browser.sleep(2000)
        await element(by.id('addname')).click();
        await element(by.id('addname')).sendKeys("between space");
        await element(by.id('addnotes')).click();
        browser.sleep(2000);
        await element(by.id('cancelRegion')).click();
    })


    it("TID-ES-001-066 Add button should be disable in add an element page", async () => {
        await element(by.id('parent-1')).click();
        await element(by.id('addNodeToHierarchyTree')).click();
        await browser.sleep(2000)
        await browser.actions().mouseMove(element(by.id('submitRegion'))).perform()
        await browser.sleep(2000);
        await element(by.id('cancelRegion')).click();
    })

    it("TID-ES-001-067 After fill any name in input field add button should be enable", async () => {
        await element(by.id('parent-1')).click();
        await element(by.id('addNodeToHierarchyTree')).click();
        browser.sleep(2000)
        await element(by.xpath('/html/body/div[1]/div[2]/div/mat-dialog-container/app-add-element/div[1]/div[1]/mat-form-field/div/div[1]/div[3]/mat-select')).click();
        browser.sleep(2000);
        await element(by.xpath('/html/body/div[1]/div[4]/div/div/div/mat-option[2]')).click();
        browser.sleep(2000)
        await element(by.id('addname')).click();
        await element(by.id('addname')).sendKeys("check enable button");
        browser.sleep(2000);
        browser.actions().mouseMove(element(by.id('submitRegion'))).perform()
        await element(by.id('cancelRegion')).click();
    });

    it("TID-ES-001-068 Cancel button should be visible on add an element page", async () => {
        await element(by.id('parent-1')).click();
        await element(by.id('addNodeToHierarchyTree')).click();
        browser.sleep(2000)
        await element(by.xpath('/html/body/div[1]/div[2]/div/mat-dialog-container/app-add-element/div[1]/div[1]/mat-form-field/div/div[1]/div[3]/mat-select')).click();
        browser.sleep(2000);
        await element(by.xpath('/html/body/div[1]/div[4]/div/div/div/mat-option[2]')).click();
        browser.sleep(2000)
        await element(by.id('addname')).click();
        await browser.actions().mouseMove(element(by.id('cancelRegion'))).perform()
        await element(by.id('cancelRegion')).click();
    });

    it("TID-ES-001-069 After click the cancel button add an element page should be go", async () => {
        await element(by.id('parent-1')).click();
        await element(by.id('addNodeToHierarchyTree')).click();
        browser.sleep(2000)
        await element(by.id('cancelRegion')).click();
    });

    it("TID-ES-001-070 Facility button should be in side nav", async () => {
        browser.actions().mouseMove(element(by.id('openListOfFacilities'))).perform()
    });

    it("TID-ES-001-071 facility button should be clickable", async () => {
        await element(by.id('openListOfFacilities')).click();
        browser.sleep(2000);
        await element(by.id('closeFacility')).click();
        browser.sleep(2000);
     });

     it("TID-ES-001-072 After clicking the facility button popup window should be open", async () => {
        await element(by.id('openListOfFacilities')).click();
        browser.sleep(2000);
        await element(by.id('closeFacility')).click();
        browser.sleep(2000);
     });

    //  it("TID-ES-001-073 Any further click outside the popup, popup window should be close", async () => {
    //     await element(by.id('openListOfFacilities')).click();
    //     browser.sleep(2000);
    //     await element(by.id('openListOfFacilities')).click();
    //  });

     it("TID-ES-001-073 Search box should be available in top of the facility popup window", async () => {
        await element(by.id('openListOfFacilities')).click();
        browser.sleep(2000)
        await element(by.id('facilitySearchBox')).click();
        browser.sleep(2000)
        await element(by.id('closeFacility')).click();
     });

     it("TID-ES-001-074 Maximum character should not be more than 128", async () => {
        await element(by.id('openListOfFacilities')).click();
        browser.sleep(2000)
        await element(by.id('facilitySearchBox')).sendKeys("ehdsvhjvvvvvvvvvvvrgddddddddddddddddddddddddyuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuurerieufcbhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhnnnnnnnnnn");
        browser.sleep(2000)
        await element(by.id('closeFacility')).click();
     });

     it("TID-ES-001-075 Import facility should be available in top of the facility popup window", async () => {
        await element(by.id('openListOfFacilities')).click();
        browser.sleep(2000)
        browser.actions().mouseMove(element(by.id('facilityCsvFileUpload'))).perform()
        browser.sleep(2000)
        await element(by.id('closeFacility')).click();
     });

     it("TID-ES-002-001 User should be able to see installed plugin under the plugin folder", async () => {
        await element(by.id('userButton')).click();
        browser.sleep(2000)
        await element(by.id('pluginStatusPageButton')).click();
        browser.sleep(2000)
     });
  
     it("TID-ES-003-002 Current user dropdown putting logout option", async () => {
        await element(by.id('userButton')).click();
        browser.sleep(2000)
        browser.actions().mouseMove(element(by.id('logoutButton'))).perform()
        browser.sleep(2000)
        // await element(by.id('userButton')).click();
     });

     it("TID-ES-003-003 User should be able to logout from this EC Core application", async () => {
        // await element(by.id('userButton')).click();
        // browser.sleep(2000)
        await element(by.id('logoutButton')).click();
        browser.sleep(5000)
     });
});

describe('OQ.ECCORE.002  Functional Testing of enterprise configurator', () => {
    browser.ignoreSynchronization = true;
    browser.manage().window().maximize();
    var originalTimeout;
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000000;
    });
    afterEach(function() {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it("TID-ESF-001-001 Admin should be able to login in Enterprise application", async () => {
        await element(by.id('userName')).click();
        browser.sleep(2000)
    });
   
    it("TID-ESF-001-002 User name field should be accept upto 100 Character", async () => {
        await element(by.name('uname')).clear();
        await element(by.name('uname')).sendKeys("qwertyuioplkjhgfdsazxcvbnmqwertyuioplkjhgfdsaxcvbnmqwertyopqwqwertyuioplkjhgfdsazxcvbnmqwertyuioplkjhgfdsaxcvbnmqwertyopqw");
        browser.sleep(2000)
    });

    it("TID-ESF-001-003 User name field should be accept any alphanumeric Character", async () => {
        await element(by.name('uname')).clear();
        await element(by.name('uname')).sendKeys("Saritasingh@$%");
        browser.sleep(2000)
    });

    it("TID-ESF-001-004 Password fied Character should be hidden while writingr", async () => {
        await element(by.name('password')).clear();
        await element(by.name('password')).sendKeys("Saritasingh12345");
        browser.sleep(2000)
    });

    it("TID-ESF-001-005 Password should be visible with clicking the hawk key", async () => {
        var dcButton= element(by.id('hawkKey'))
        browser.actions().mouseDown(dcButton).perform();
        browser.sleep(5000);
        browser.actions().mouseUp(dcButton).perform();
    });

    it("TID-ESF-001-006 Password should not be visible without clickling the hawk eye ", async () => {
        await element(by.name('password')).clear();
        await element(by.name('password')).sendKeys("Saritasingh12345");
        browser.sleep(2000)
    });

    it("TID-ESF-001-007 Login with valid user name and invalid password ", async () => {
        await element(by.name('uname')).clear();
        await element(by.name('uname')).sendKeys("Admin");
        await element(by.name('password')).clear();
        await element(by.name('password')).sendKeys("Saritasingh12345");
        await element(by.name('loginbutton')).click();
        browser.sleep(6000)
    });

    it("TID-ESF-001-008 Login with invalid user name and valid password", async () => {
        await element(by.name('uname')).clear();
        await element(by.name('uname')).sendKeys("Saritasingh123");
        await element(by.name('password')).clear();
        await element(by.name('password')).sendKeys("Icumed@1");
        await element(by.name('loginbutton')).click()
        browser.sleep(6000)
    });

    it("TID-ESF-001-009 Login by invalid username and password ", async () => {
        await element(by.name('uname')).clear();
        await element(by.name('uname')).sendKeys("Saritasingh123");
        await element(by.name('password')).clear();
        await element(by.name('password')).sendKeys("Icumed@123");
        await element(by.name('loginbutton')).click()
        browser.sleep(6000)
    });

    it("TID-ESF-001-010 Login by empty username and valid password", async () => {
        await element(by.name('uname')).clear();
        await element(by.name('password')).clear();
        await element(by.name('password')).sendKeys("Sarita@123");
       //await element(by.name('loginbutton')).click()
        browser.sleep(6000)
    });
    
    it("TID-ESF-001-011 Login button should not be visible with valid username and empty password", async () => {
        await element(by.name('uname')).clear();
        await element(by.name('uname')).sendKeys("Admin");
        await element(by.name('password')).clear();
        browser.sleep(2000)
        //await element(by.name('password')).click();
        await element(by.name('loginbutton')).click()
        // browser.sleep(2000)
        // element(by.id("mat-error-1")).getText().then((value)=>{
        //     console.log("----",value);
        //     expect(value).toEqual("Password can't be empty");
        // })
    });
   
    it("TID-ESF-001-012 Login button should not be visible with valid username and empty password", async () => {
        await element(by.name('uname')).clear();
        browser.sleep(2000)
        await element(by.name('password')).clear();
    });

    it("TID-ESF-001-013 User should be able to login of the EC-Core with correct credentials maped in ISAS", async () => {
        await element(by.name('uname')).clear();
        await element(by.name('uname')).sendKeys("Admin");
        browser.sleep(2000)
        await element(by.name('password')).clear();
        await element(by.name('password')).sendKeys("Icumed@1");
        browser.sleep(2000)
        await element(by.name('loginbutton')).click()
        browser.sleep(10000)
    })

    it("TID-ESF-002-001 Root should be required in Enterprise hierarchy", async () => {
        await element(by.id('parent-1')).click();
        browser.sleep(2000)
    })

    it("TID-ESF-002-002 User should be able to see expand/collapse option when child is available", async () => {
        await element(by.id('expandColapseHierarchyTreeNode')).click();
        browser.sleep(2000)
        await element(by.id('expandColapseHierarchyTreeNode')).click();
        browser.sleep(2000)
    });

    it("TID-ESF-002-003 User should be able to add node and build Enterprise hierarchy", async () => {
        await element(by.id('parent-1')).click();
        browser.sleep(2000)
        await element(by.id('addNodeToHierarchyTree')).click();
        browser.sleep(2000)
        await element(by.xpath('/html/body/div[1]/div[2]/div/mat-dialog-container/app-add-element/div[1]/div[1]/mat-form-field/div/div[1]/div[3]/mat-select')).click();
        browser.sleep(2000);
        await element(by.xpath('/html/body/div[1]/div[4]/div/div/div/mat-option[1]')).click();
        browser.sleep(2000)
        await element(by.id('addname')).click();
        await element(by.id('addname')).sendKeys("Testing node");
        await element(by.id('addnotes')).sendKeys("Description of node");
        browser.sleep(2000);
        await element(by.id('submitRegion')).click(); 
     });

     it("TID-ESF-002-004 User should be able to delete node in Enterprise hierarchy", async () => {
        await element(by.id('parent-1')).click();
        browser.sleep(2000)
        await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[4]/li')).click();
        browser.sleep(2000)
        await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[4]/div/mat-icon[2]')).click();
        browser.sleep(2000)
     })

        xit("TID-ESF-002-005 User should not be able to add node under the facility level", async () => {
         await element(by.id('parent-1')).click(); 
         browser.sleep(2000);
         await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[3]/li')).click();
         browser.sleep(2000)
         await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[3]/div/mat-icon[1]')).click();
         browser.sleep(2000)
        })

        it("TID-ESF-003-001 User should be able to add Region/Campus in Enterprise hierarchy", async () => {
            
            // await element(by.id('settingsPageButton')).click();
            // browser.sleep(2000)
            // await element(by.id('homePageButton')).click();
            // browser.sleep(2000)
            await element(by.id('parent-1')).click();
            browser.sleep(2000)
            await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/li')).click();
            browser.sleep(2000);
            await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/div/mat-icon[2]')).click();
            browser.sleep(2000);
            await element(by.xpath('/html/body/div[1]/div[2]/div/mat-dialog-container/app-add-element/div[1]/div[1]/mat-form-field/div/div[1]/div[3]/mat-select')).click();
            browser.sleep(2000);
            await element(by.xpath('/html/body/div[1]/div[4]/div/div/div/mat-option[1]')).click();
            browser.sleep(2000)
            await element(by.id('addname')).click();
            await element(by.id('addname')).sendKeys("Testing Campus");
            await element(by.id('addnotes')).sendKeys("Description of testing");
            browser.sleep(2000);
            await element(by.id('submitRegion')).click(); 
            browser.sleep(2000)
       })

       it("TID-ESF-003-002 User should be able to delete newly added node in Enterprise hierarchy tree", async () => {
          await element(by.id('parent-1')).click(); 
          browser.sleep(2000);
          await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[4]/li')).click();
          browser.sleep(2000)
          await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[4]/div/mat-icon[2]')).click();
          browser.sleep(3000)
       })

       it("TID-ESF-004-001 Admin should be able to add one or more node in Enterprise hierarchy tree to represent a Plugin Service loaded in the system ", async () => {
        await element(by.id('parent-1')).click(); 
        browser.sleep(2000);
        await element(by.id('addNodeToHierarchyTree')).click(); 
        browser.sleep(2000);
        await element(by.id('addname')).sendKeys("First node");
        await element(by.id('addnotes')).sendKeys("Description of first node");
        browser.sleep(2000);
        await element(by.id('submitRegion')).click(); 
        browser.sleep(2000);
        await element(by.id('parent-1')).click(); 
        browser.sleep(2000);
        await element(by.id('addNodeToHierarchyTree')).click(); 
        browser.sleep(2000);
        await element(by.id('addname')).sendKeys("Second node");
        await element(by.id('addnotes')).sendKeys("Description of Second node");
        browser.sleep(2000);
        await element(by.id('submitRegion')).click(); 
        browser.sleep(2000);
        })

        it("TID-ESF-005-001 User should be able to delete add one or more node in Enterprise hierarchy tree", async () => {
            await element(by.id('parent-1')).click(); 
            browser.sleep(2000);
            await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[5]/li')).click();
            browser.sleep(2000)
            await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[5]/div/mat-icon[2]')).click();
            browser.sleep(2000)
            await element(by.id('parent-1')).click(); 
            browser.sleep(2000);
            await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/li')).click();
            browser.sleep(2000)
            await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/div/mat-icon[2]')).click();
            browser.sleep(2000)
           
        })

        it("TID-ESF-006-001 User should be able to navigate the hierarchy tree", async () => {
            await element(by.id('parent-1')).click(); 
            browser.sleep(2000);
            await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[3]/li')).click();
            browser.sleep(2000)
         })

         it("TID-ESF-007-001 User should be able to see the properties set on the Item upon navigating the Enterprise Tree", async () => {
            await element(by.id('parent-1')).click(); 
            browser.sleep(2000);
            await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[3]/li')).click();
            browser.sleep(2000)
            await element(by.id('FacilityName')).click(); 
            browser.sleep(2000);
            await element(by.id('AddressLine1')).click(); 
            browser.sleep(2000);
        })

        it("TID-ESF-008-001 User should be able to edit the properties set on the Item upon navigating the Enterprise Tree", async () => {
            await element(by.id('parent-1')).click(); 
            browser.sleep(2000);
            await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[3]/li')).click();
            browser.sleep(2000)
            await element(by.id('FacilityName')).clear(); 
            browser.sleep(2000);
            await element(by.id('FacilityName')).sendKeys("updated facility"); 
            browser.sleep(2000);
            await element(by.id('updateFacility')).click(); 
            browser.sleep(2000);
        })

        it("TID-ESF-009-001 User should be able to save the properties set on the Item upon navigating the Enterprise Tree after editing the entries", async () => {
            await element(by.id('parent-1')).click(); 
            browser.sleep(2000);
            await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[3]/li')).click();
            browser.sleep(2000)
            await element(by.id('FacilityName')).click(); 
            browser.sleep(2000);
        })

        it("TID-ESF-010-001 System shall provide a web interface to define/view plugin of the Core Service", async () => {
            await element(by.id('userButton')).click(); 
            browser.sleep(2000); 
            await element(by.id('pluginStatusPageButton')).click(); 
            browser.sleep(2000);
            await element(by.id('homePageButton')).click(); 
            browser.sleep(2000);
        })

        it("TID-ESF-011-001 User should be able to change  the list of Plugins loaded in system ", async () => {
            await element(by.id('userButton')).click(); 
            browser.sleep(2000); 
            await element(by.id('pluginStatusPageButton')).click(); 
            browser.sleep(2000);
            await element(by.id('enableDisabledPlugin')).click(); 
            browser.sleep(2000);
            await element(by.id('homePageButton')).click(); 
            browser.sleep(2000);
        })

        it("TID-ESF-011-002 User should be able to view the list of Plugins loaded in system", async () => {
            await element(by.id('userButton')).click(); 
            browser.sleep(2000); 
            await element(by.id('pluginStatusPageButton')).click(); 
            browser.sleep(2000);
            await element(by.id('homePageButton')).click(); 
            browser.sleep(2000);
        })

        it("TID-ESF-012-001 System should be able to shows the UI End Point addElement for the selected Plugins when the selected Item is a Plugin Service", async () => {
            await element(by.id('parent-1')).click(); 
            browser.sleep(2000)
            await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/li')).click();
            browser.sleep(2000)
        })

        it("TID-ESF-012-002 System should be able to invoke the UI End Point updateElement with all values when user navigate the Tree and the selected item is a Plugin Service ", async () => {
            await element(by.id('parent-1')).click(); 
            browser.sleep(2000)
            await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[2]/li')).click();
            browser.sleep(2000)
            await element(by.id('nodeNotes')).sendKeys("updated region description"); 
            browser.sleep(2000); 
            await element(by.id('updateNode')).click(); 
            browser.sleep(2000); 
        })

        //   it("TID-ES-002-006 User should not be able to remove root in Enterprise hierarchy", async () => {
        //     await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[1]')).click();
        //     browser.sleep(2000)
        //     await element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[1]/div/mat-icon[3]')).click();
        //     browser.sleep(2000)
        //  })
        
})

  describe('OQ.ECCORE.003 Functional-Extensibility Testing of enterprise configurator', () => {
    browser.ignoreSynchronization = true;
    browser.manage().window().maximize();
    var originalTimeout;
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000000;
    });
    afterEach(function() {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it("TID-ESF-001-001 Launch the Plugin that has one instance is showing right corner in the UI", async () => {
        // await browser.get('http://localhost:4200/dashboard')
        // browser.sleep(5000)
        await element(by.id('goToSingleInstancePlugin')).click();
        browser.sleep(6000)
        await element(by.id('homePageButton')).click();
        browser.sleep(5000)
    })

    it("TID-ESF-001-002 Multi instance plugin should be add in Enterprise hierarchy", async () => {

    })

    it("TID-ESE-002-001 Plugin icon show in navigation control area", async () => {
        browser.actions().mouseMove(element(by.id('goToSingleInstancePlugin'))).perform();
        browser.sleep(2000) 
        browser.actions().mouseMove(element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[1]/div[2]/img'))).perform();
        browser.sleep(2000)
        browser.actions().mouseMove(element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[1]/div[3]/img'))).perform();
        browser.sleep(2000)
        browser.actions().mouseMove(element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[1]/div[4]/img'))).perform();
        browser.sleep(2000) 

    })

    it("TID-ESE-004-001 System should be support only the boolean type of inputs", async () => {
        await element(by.id('homePageButton')).click();
        browser.sleep(2000)
        await element(by.id('userButton')).click();
        browser.sleep(2000)
        await element(by.id('pluginStatusPageButton')).click();
        browser.sleep(2000)
        await element(by.id('enableDisabledPlugin')).click();
        browser.sleep(2000);
    })

    it("TID-ESE-005-001 System should be support only the boolean type of inputs", async () => {
        await element(by.id('enableDisabledPlugin')).click();
        browser.sleep(2000);
        await element(by.xpath('/html/body/app-root/app-dashboard/app-about/div/table/tbody/tr[1]/td[6]/mat-checkbox')).click();
        browser.sleep(2000)
        await element(by.id('homePageButton')).click();
        browser.sleep(2000)
    })

})

describe('OQ.ECCORE.004 Functional–Roles Management Testing of enterprise configurator', () => {
    browser.ignoreSynchronization = true;
    browser.manage().window().maximize();
    var originalTimeout;
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000000;
    });
    afterEach(function() {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it("TID-ESS-001-001 Web Interface of Setting Page of Core shall have the following Enterprise hierarchy Items (Group Hierarchy) as default options Region[s],Campus[s],Facilities[s]", async () => {
        await element(by.id('settingsPageButton')).click();
        browser.sleep(2000)
        await element(by.id('levelName-0')).click();
        browser.sleep(2000)
        await element(by.id('levelName-1')).click();
        browser.sleep(2000)
        await element(by.id('levelName-2')).click();
        browser.sleep(2000)
    })

    it('TID-ESS-002-001 System should be able to provide controls to define name for any Hierarchy Items', async()=>{
        await element(by.id('levelName-1')).clear();
        browser.sleep(2000)
        await element(by.id('levelName-1')).sendKeys("Campus hierarchy level");
        browser.sleep(2000)
        await element(by.id('updateHierarchyLevels')).click();
        browser.sleep(2000)
        await element(by.id('homePageButton')).click();
        browser.sleep(2000)
    })
    
    it('TID-ESS-004-001 System should be able to provide limit the no of levels that can created in Enterprise Tree', async()=>{
        await element(by.id('settingsPageButton')).click();
        browser.sleep(2000)
        await element(by.xpath('/html/body/app-root/app-dashboard/app-settings/div/div/div[1]/form/div[2]/div[2]/div/div[3]/button[1]/span/mat-icon')).click();
        browser.sleep(2000)
        await element(by.xpath('/html/body/app-root/app-dashboard/app-settings/div/div/div[1]/form/div[2]/div[2]/div/div[3]/button[1]/span/mat-icon')).click();
        browser.sleep(2000)
        await element(by.xpath('/html/body/app-root/app-dashboard/app-settings/div/div/div[1]/form/div[2]/div[2]/div/div[3]/button[1]/span/mat-icon')).click();
        browser.sleep(2000)
    })

    it('TID-ESS-005-001 System Should have default value for configuration entry for LIMIT_ENTERPRISE_TREE_LEVEL as 10', async()=>{
        await element(by.xpath('/html/body/app-root/app-dashboard/app-settings/div/div/div[1]/form/div[2]/div[2]/div/div[3]/button[1]/span/mat-icon')).click();
        browser.sleep(2000)
        await element(by.xpath('/html/body/app-root/app-dashboard/app-settings/div/div/div[1]/form/div[2]/div[2]/div/div[3]/button[1]/span/mat-icon')).click();
        browser.sleep(2000)
        await element(by.xpath('/html/body/app-root/app-dashboard/app-settings/div/div/div[1]/form/div[2]/div[2]/div/div[3]/button[1]/span/mat-icon')).click();
        browser.sleep(2000)
        await element(by.xpath('/html/body/app-root/app-dashboard/app-settings/div/div/div[1]/form/div[2]/div[2]/div/div[3]/button[1]/span/mat-icon')).click();
        browser.sleep(2000)
    })
})

describe('OQ.ECCORE.005 Functional–Plugin List Testing of enterprise configurator', () => {
    browser.ignoreSynchronization = true;
    browser.manage().window().maximize();
    var originalTimeout;
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000000;
    });
    afterEach(function() {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it('TID-ESP-002-001 Plugin List should be provide an option to choose a Service/Plugin and disable the Service/Plugin', async()=>{
            await element(by.id("homePageButton")).click();
            browser.sleep(3000);
            await element(by.id('userButton')).click()
            browser.sleep(2000)
            await element(by.id('pluginStatusPageButton')).click();
            browser.sleep(2000)
            await element(by.id('enableDisabledPlugin')).click();
            browser.sleep(2000)
    })

    it('TID-ESP-002-002 For Default Plugin list should not be provide any option for choose a Service/Plugin and disable the Service/Plugin for a default plugin', async()=>{
        await element(by.id("homePageButton")).click();
        browser.sleep(3000);
        await element(by.id('userButton')).click()
        browser.sleep(2000)
        await element(by.id('pluginStatusPageButton')).click();
        browser.sleep(2000)
        await element(by.id('enableDisabledPlugin')).click();
        browser.sleep(2000)
    })

        it('TID-ESP-003-001 Plugin List should be provide an option to choose a Service/Plugin and enable the Service/Plugin when the Service/Plugin is disabled earlier ', async()=>{
            await element(by.id("homePageButton")).click();
            browser.sleep(3000);
            await element(by.id('userButton')).click()
            browser.sleep(2000)
            await element(by.id('pluginStatusPageButton')).click();
            browser.sleep(2000)
            await element(by.id('enableDisabledPlugin')).click();
            browser.sleep(2000)

        })
})

    describe('OQ.ECCORE.006 Functional–Facility Tree Testing of enterprise configurator', () => {
        browser.ignoreSynchronization = true;
        browser.manage().window().maximize();
        var originalTimeout;
        beforeEach(() => {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000000;
        });
        afterEach(function() {
          jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        });
    
        xit('TID-ESS-001-001 System should be able to provide add button Facility tree management ', async()=>{
            await element(by.id("homePageButton")).click();
            browser.sleep(3000);
            await element(by.id("parent-1")).click();
            browser.sleep(3000);
            await element(by.id("addNodeToHierarchyTree")).click();
            browser.sleep(3000);
            await element(by.xpath('/html/body/div[1]/div[2]/div/mat-dialog-container/app-add-element/div[1]/div[1]/mat-form-field/div/div[1]/div[3]/mat-select')).click();
            browser.sleep(2000);
            await element(by.xpath('/html/body/div[1]/div[4]/div/div/div/mat-option[3]')).click();
            browser.sleep(2000)
            await element(by.id("FacilityName")).sendKeys("testing facility");
            browser.sleep(1000);
            await element(by.id("AddressLine1")).sendKeys("testing AddressLine1");
            browser.sleep(1000);
            await element(by.id("AddressLine2")).sendKeys("testing AddressLine2");
            browser.sleep(1000);
            await element(by.id("AddressLine3")).sendKeys("testing AddressLine3");
            browser.sleep(1000);
            await element(by.id("selectCountry")).click();
            
            browser.sleep(1000);
            await element(by.xpath("/html/body/div[3]/div[2]/div/div/div/mat-option[3]")).click();
            browser.sleep(1000);
            await element(by.id("selectState")).click();
            browser.sleep(1000);
            await element(by.xpath("/html/body/div[3]/div[2]/div/div/div/mat-option[3]")).click();
            browser.sleep(1000);
            await element(by.id("selectCity")).click();
            browser.sleep(1000);
            await element(by.xpath("/html/body/div[3]/div[2]/div/div/div/mat-option[3]")).click();
            browser.sleep(1000);
            await element(by.id("addFacility")).click();
            browser.sleep(4000);
      })
        
      it('TID-ESFT-001-002 System should be able to provide edit button for Facility tree management ', async()=>{
        await element(by.id("parent-1")).click();
        browser.sleep(1000);
        await element(by.xpath("/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[3]/li")).click();
        browser.sleep(2000);
        await element(by.id("FacilityName")).clear();
        browser.sleep(1000);
        await element(by.id("FacilityName")).sendKeys("testing facility updated");
        browser.sleep(3000);
        await element(by.id("updateFacility")).click();
        browser.sleep(4000);
      })

      it('TID-ESFT-001-003 System should be able to provide search button for Facility tree management', async()=>{
        await element(by.id("openListOfFacilities")).click();
        browser.sleep(2000);
        await element(by.id("facilitySearchBox")).click();
        browser.sleep(2000);
        await element(by.id("facilitySearchBox")).sendKeys("facility1");
        browser.sleep(3000);
        await element(by.id("closeFacility")).click();
        browser.sleep(2000);
       })

       it('TID-ESFT-001-004 User should be not able to search specific facility if facility name not available in Enterprise tree', async()=>{
        await element(by.id("openListOfFacilities")).click();
        browser.sleep(2000);
        await element(by.id("facilitySearchBox")).click();
        browser.sleep(2000);
        await element(by.id("facilitySearchBox")).sendKeys("not found");
        browser.sleep(3000);
        await element(by.id("closeFacility")).click();
        browser.sleep(2000);
       })

       xit('TID-ESFT-001-005 User should be not able to delete specific facility from Enterprise tree ', async()=>{
        await element(by.id("parent-1")).click();
        browser.sleep(1000);
        await element(by.xpath("/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[3]/li")).click();
        browser.sleep(2000);
        await element(by.xpath("/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[3]/div/mat-icon[2]")).click();
        browser.sleep(2000);
      })

      it('TID-ESFT-002-001 User should be able to show the list of Item[s]/Group[s] and the list of Plugins upon selection of add button', async()=>{
        await element(by.id("parent-1")).click();
        browser.sleep(2000);
        await element(by.id("expandColapseHierarchyTreeNode")).click();
        browser.sleep(2000);
        await element(by.id("expandColapseHierarchyTreeNode")).click();
        browser.sleep(2000);
        await element(by.xpath("/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/as-split/as-split-area[1]/mat-tree/mat-tree-node[3]/li")).click();
        browser.sleep(2000);
       })

       
      it('TID-ESFT-003-001 User Should be able to show the UI for add element from Core Service when the selected Item is from Core Service', async()=>{
        await element(by.id("openListOfFacilities")).click();
        browser.sleep(2000);
        await element(by.xpath("/html/body/div[2]/div[2]/div/mat-dialog-container/app-facilities-list/div[1]/mat-tab-group/div/mat-tab-body[1]/div/div/mat-table/mat-row/mat-cell[3]")).click();
        browser.sleep(2000);
       })

    })