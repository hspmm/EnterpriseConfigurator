import { browser,element, by} from 'protractor';
import { __values } from 'tslib';
import { ComponentFixture } from '@angular/core/testing';
// import {HttpClient} from "protractor-http-client"

import { AuthenticationService } from '../../src/app/services/authentication.service'

const Request = require('request');
// const http = new HttpClient('http://localhost:3000/');

const baseUrl = 'http://localhost:4200'



describe('OQ.ECCORE.001  User can able to login enterprise configurator', () => {
  browser.ignoreSynchronization = true;
  browser.manage().window().maximize();
  beforeEach(() => {

  });

  it('Step#1  Test manager can able to display Login page', async () => {
    await browser.get('');
    await browser.sleep(1000);
  });

  it('Step#2  User can able to click the login button', async () => {
    await element(by.id('login-button')).click();
    await browser.sleep(1000);

  });

});

describe("OQ.ECCORE.000  user Create Enterprise ", ()=>{
  browser.sleep(1000);

  it('Step#1  user Create Region1,Region2, Region3 EC hierarchy', async () => {
    element(by.xpath('//*[@id="enterpriseName"]')).sendKeys('Kaiser Permanente');
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div/form/button')).click();
    browser.sleep(2000);    
  });
})

describe("OQ.ECCORE.002  user Create and Manage EC hierarchy ", ()=>{
  var originalTimeout;
  beforeEach(function() {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
  });

  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });
  browser.ignoreSynchronization = true;
  browser.manage().window().maximize();
  browser.sleep(1000);
  
  it('Step#1  user Create Region1,Region2, Region3 EC hierarchy', async () => {
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[1]/button[1]')).click();
    browser.sleep(1000);
    element(by.css('select option:nth-child(4)')).click();
    browser.sleep(1000);
    element(by.xpath('//*[@id="regionName"]')).sendKeys('Region1');
    element(by.xpath('//*[@id="notes"]')).sendKeys('Region1');
    browser.sleep(1000);
    element(by.xpath('//*[@id="add-to-hierarchy-btn"]')).click();
    browser.sleep(5000);

    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[1]/button[1]')).click();
    browser.sleep(1000);
    element(by.css('select option:nth-child(4)')).click();
    browser.sleep(1000);
    element(by.xpath('//*[@id="regionName"]')).sendKeys('Region2');
    element(by.xpath('//*[@id="notes"]')).sendKeys('Region2');
    browser.sleep(1000);
    element(by.xpath('//*[@id="add-to-hierarchy-btn"]')).click();
    browser.sleep(5000);

    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[1]/button[1]')).click();
    browser.sleep(1000);
    element(by.css('select option:nth-child(4)')).click();
    browser.sleep(1000);
    element(by.xpath('//*[@id="regionName"]')).sendKeys('Region3');
    element(by.xpath('//*[@id="notes"]')).sendKeys('Region3');
    browser.sleep(1000);
    element(by.xpath('//*[@id="add-to-hierarchy-btn"]')).click();
    browser.sleep(5000);

    
  });

  
  it('Step#2  user See only created Region1, Region2, Region3 in  EC Tree ', async () => {
    //await browser.sleep(4000);

    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[2]/li')).click();
    await browser.sleep(2000);
    expect(element(by.xpath('//*[@id="name"]')).getAttribute('value')).toEqual('Region1')

    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[3]/li')).click();
    await browser.sleep(2000);
    expect(element(by.xpath('//*[@id="name"]')).getAttribute('value')).toEqual('Region2')

    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[4]/li')).click();
    await browser.sleep(2000);
    expect(element(by.xpath('//*[@id="name"]')).getAttribute('value')).toEqual('Region3')

    browser.refresh()
    await browser.sleep(3000);
  });


  it('Step#3  user Create Campus11 Campus12  under Region1, ...under Region2 ,...under Region2 ', () => {
    
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[2]/li')).click();
    browser.sleep(2000);
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[1]/button[1]')).click();
    browser.sleep(1000);
    element(by.css('select option:nth-child(5)')).click();
    browser.sleep(1000);
    element(by.xpath('//*[@id="regionName"]')).sendKeys('Campus11');
    element(by.xpath('//*[@id="notes"]')).sendKeys('Campus11');
    browser.sleep(1000);
    element(by.xpath('//*[@id="add-to-hierarchy-btn"]')).click();
    browser.sleep(2000);

    browser.refresh()
    browser.sleep(3000);
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[4]/li')).click();
    browser.sleep(2000);
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[1]/button[1]')).click();
    browser.sleep(1000);
    element(by.css('select option:nth-child(5)')).click();
    browser.sleep(1000);
    element(by.xpath('//*[@id="regionName"]')).sendKeys('Campus12');
    element(by.xpath('//*[@id="notes"]')).sendKeys('Campus12');
    browser.sleep(1000);
    element(by.xpath('//*[@id="add-to-hierarchy-btn"]')).click();
    browser.sleep(2000);

    browser.refresh()
    browser.sleep(3000);
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[5]/li')).click();
    browser.sleep(2000);
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[1]/button[1]')).click();
    browser.sleep(1000);
    element(by.css('select option:nth-child(5)')).click();
    browser.sleep(1000);
    element(by.xpath('//*[@id="regionName"]')).sendKeys('Campus13');
    element(by.xpath('//*[@id="notes"]')).sendKeys('Campus13');
    browser.sleep(1000);
    element(by.xpath('//*[@id="add-to-hierarchy-btn"]')).click();
    browser.sleep(2000);

    browser.refresh()
    browser.sleep(2000);
  });


  it('Step#4  user See only created Campus11 Campus12 under Region1, ...under Region2 in  EC Tree ', async () => {
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div/div/mat-tree/mat-tree-node[2]/button')).click();
    await browser.sleep(1000);
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[3]/li')).click();
    await browser.sleep(2000);
    expect(element(by.xpath('//*[@id="name"]')).getAttribute('value')).toEqual('Campus11')
    await browser.sleep(2000);


    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[4]/button')).click();
    await browser.sleep(1000);
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[5]/li')).click();
    await browser.sleep(2000);
    expect(element(by.xpath('//*[@id="name"]')).getAttribute('value')).toEqual('Campus12')


    /* element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[4]/button')).click();
    await browser.sleep(1000); */
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[7]/li')).click();
    await browser.sleep(2000);
    expect(element(by.xpath('//*[@id="name"]')).getAttribute('value')).toEqual('Campus13')

    
  });

  it('Step#5  user create Facility1, Facility2, Facility, Facility3, ...under Campus11, ...under Campus12, ...under Campus12 in  EC Tree ', () => {
   /*  element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[2]/button')).click();
    await browser.sleep(2000);
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[3]/li')).click();
    await browser.sleep(2000);
 */

    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[3]/li')).click();
    browser.sleep(2000);
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[1]/button[1]')).click();
    browser.sleep(1000);
    element(by.css('select option:nth-child(7)')).click();
    browser.sleep(1000);
    element(by.xpath('//*[@id="FacilityName"]')).sendKeys('Facility1');
    element(by.xpath('//*[@id="AddressLine1"]')).sendKeys('Address1');
    browser.sleep(1000);    
    var elem = element(by.id('add-facility-btn'));
    browser.actions().mouseMove(elem).perform();    
    element(by.xpath('//*[@id="add-facility-btn"]')).click();
    browser.sleep(3000);
    browser.refresh()
    browser.sleep(3000);
    
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div/div/mat-tree/mat-tree-node[4]/button')).click();
    browser.sleep(1000);
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[5]/li')).click();
    browser.sleep(2000);
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[1]/button[1]')).click();
    browser.sleep(1000);
    element(by.css('select option:nth-child(7)')).click();
    browser.sleep(1000);
    element(by.xpath('//*[@id="FacilityName"]')).sendKeys('Facility2');
    element(by.xpath('//*[@id="AddressLine1"]')).sendKeys('Address2');
    browser.sleep(1000);
    var elem = element(by.id('add-facility-btn'));
    browser.actions().mouseMove(elem).perform(); 
    element(by.xpath('//*[@id="add-facility-btn"]')).click();
    browser.sleep(5000);
    browser.refresh()
    browser.sleep(3000);

    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div/div/mat-tree/mat-tree-node[5]/button')).click();
    browser.sleep(1000);
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[6]/li')).click();
    browser.sleep(2000);
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[1]/button[1]')).click();
    browser.sleep(1000);
    element(by.css('select option:nth-child(7)')).click();
    browser.sleep(1000);
    element(by.xpath('//*[@id="FacilityName"]')).sendKeys('Facility3');
    element(by.xpath('//*[@id="AddressLine1"]')).sendKeys('Address3');
    browser.sleep(1000);
    var elem = element(by.id('add-facility-btn'));
    browser.actions().mouseMove(elem).perform(); 
    element(by.xpath('//*[@id="add-facility-btn"]')).click();
    browser.sleep(5000);

    browser.refresh()
    browser.sleep(3000);

    
  });


  it('Step#6  user can see Facility1, Facility2, Facility, Facility3, ...under Campus11, ...under Campus12, ...under Campus12 in  EC Tree ', async () => {
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div/div/mat-tree/mat-tree-node[2]/button')).click();
    await browser.sleep(1000);
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div/div/mat-tree/mat-tree-node[3]/button')).click();
    browser.sleep(1000);
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[4]/li')).click();
    browser.sleep(1000);
    expect(element(by.xpath('//*[@id="FacilityName"]')).getAttribute('value')).toEqual('Facility1')
    await browser.sleep(2000);


    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[5]/button')).click();
    await browser.sleep(1000);
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[6]/button')).click();
    browser.sleep(1000);
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[7]/li')).click();
    browser.sleep(1000);
    expect(element(by.xpath('//*[@id="FacilityName"]')).getAttribute('value')).toEqual('Facility2')
    await browser.sleep(2000);

   /*  element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[5]/button')).click();
    await browser.sleep(1000); */
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[9]/button')).click();
    browser.sleep(1000);
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/div/mat-tree/mat-tree-node[10]/li')).click();
    browser.sleep(1000);
    expect(element(by.xpath('//*[@id="FacilityName"]')).getAttribute('value')).toEqual('Facility3')
    await browser.sleep(2000);
    
    

    
  });


  xit('Step#5  user can add sample service plugin under campus11 in  EC Tree ', async () => {
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/mat-tree/mat-tree-node[2]/button')).click();
    await browser.sleep(3000);
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/mat-tree/mat-tree-node[3]/li')).click();
    await browser.sleep(2000);
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[1]/button[1]')).click();
    browser.sleep(1000);
    element(by.css('select option:nth-child(3)')).click();
    browser.sleep(1000);
    element(by.xpath('//*[@id="description"]')).sendKeys('Test Desc');
    element(by.xpath('//*[@id="locationName"]')).sendKeys('Test Location');
    element(by.xpath('//*[@id="address"]')).sendKeys('Test Address');
    element(by.xpath('//*[@id="name"]')).sendKeys('Sample service');
    element(by.xpath('//*[@id="mat-dialog-2"]/app-add-element/div[2]/button[1]')).click();
    browser.sleep(5000);

    
  });

  xit('Step#6  user can see sample service plugin under campus11 in  EC Tree ', async () => {
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/mat-tree/mat-tree-node[3]/button')).click();
    await browser.sleep(1000);
    element(by.xpath('/html/body/app-root/app-dashboard/app-heirarchy-tree/div/div[2]/div[1]/mat-tree/mat-tree-node[4]/li')).click();
    await browser.sleep(3000);
    expect(element(by.xpath('//*[@id="description"]')).getAttribute('value')).toEqual('Test Desc')
    expect(element(by.xpath('//*[@id="locationName"]')).getAttribute('value')).toEqual('Test Location')
    expect(element(by.xpath('//*[@id="address"]')).getAttribute('value')).toEqual('Test Address')
    expect(element(by.xpath('//*[@id="name"]')).getAttribute('value')).toEqual('Sample service')
    await browser.sleep(3000);
    
  });



})

xdescribe("OQ.ECCORE.003  Test manager checking the API's ", ()=>{
  browser.ignoreSynchronization = true;
  browser.manage().window().maximize();
  browser.sleep(1000);

  it('Step#1  get DB connection data, API should return DB Connection info', async () => {
 
    /* http.get('api/v1/db/info',{'Accesstoken':'abcd1234'}).then(response=>{
      //console.log("DB RESP:",JSON.parse(response.body))
      let responseData = JSON.parse(response.body)
      expect(responseData.responseCode).toEqual(0)
      expect(responseData.statusCode).toEqual(200)
      expect(responseData.data.db).toEqual('mssql')
      expect(responseData.data.username).toEqual('sa')
      expect(responseData.data.password).toEqual('Icumed@1')
      expect(responseData.data.database).toEqual('Enterprise')
      expect(responseData.data.host).toEqual('VM-DEV-LOTUS03')
      expect(responseData.data.server).toEqual('VM-DEV-LOTUS03\\MSSQLSERVER17')
      expect(responseData.data.instance).toEqual('MSSQLSERVER17')
    }) */

    
  });


  it('Step#2  get Tree data, API should return hierarchy tree', async () => {
 
    /* http.get('api/v1/hierarchy/tree').then(response=>{
      //console.log("TREE RESP:",JSON.parse(response.body))
      let responseData = JSON.parse(response.body)
      expect(responseData.responseCode).toEqual(0)
      expect(responseData.statusCode).toEqual(200)
      expect(responseData.data[0].NodeName).toEqual("Kaiser Permanente")
      expect(responseData.data[0].children[0].NodeName).toEqual("Region1")
      expect(responseData.data[0].children[0].children[0].NodeName).toEqual("Campus11")
      expect(responseData.data[0].children[0].children[0].children[0].NodeName).toEqual("Sample service")
      
      
      expect(responseData.data[0].children[1].NodeName).toEqual("Region2")
      expect(responseData.data[0].children[1].children[0].NodeName).toEqual("Campus12")
      expect(responseData.data[0].children[1].children[0].children[0].NodeName).toEqual("Sample")
    }).catch(err=>{
      console.log("TREE ERR:",err)
    }) */

 
  });



})

xdescribe("OQ.ECCORE.004  Test manager checking the API's Error handling", ()=>{
  browser.ignoreSynchronization = true;
  browser.manage().window().maximize();
  browser.sleep(1000);

  it('Step#1  get Tree data, API should return error', async () => {
    
   /*  http.get('api/v1/hierarchy/tree').then(response=>{
      console.log('Success API test:',JSON.parse(response.body))
      let responseData = JSON.parse(response.body)
      expect(responseData.responseCode).toEqual(9017)
      expect(responseData.statusCode).toEqual(500)
      expect(responseData.statusMessage).toEqual("Error while getting hierarchy Tree")
      expect(responseData.errorMessage).toEqual("Something went wrong while doing operations with Database")
    }).catch(err=>{
      console.log('Error API test:',err)
      expect(err.responseCode).toEqual(500)
      expect(err.statusCode).toEqual(500)
      
    }) */

  });

 

})