# auto-report-dneo
Automatically send desknet's NEO daily report.

## Requirement
- node
- npm or yarn

## Installation
```
git clone https://github.com/akihira207/auto-report-dneo.git
cd auto-report-dneo
yarn install
```
or
```
git clone https://github.com/akihira207/auto-report-dneo.git
cd auto-report-dneo
npm install
```
## Usage
### Setting
Please provide the necessary information for setting.json
```json
{
    "headlessMode"    : "true",
    "url"             : "https://example.com",
    "userId"          : "test123",
    "password"        : "test321",
    "myNameIs"        : "yamada taro",
    "myDepartmentIs"  : "system department",
    "myNoticeToGroup" : "system group"
}
```
For myNoticeToGroup, please write the label of the notification destination.
![Setting point of myNoticeToGroup](https://github.com/akihira207/auto-report-dneo/blob/images/noriceToGroup.png "myNoticeToGroup")

Please list the content you would like to report in the daily report in HTML format for report.txt
```txt
<p>Mr.Sato、Mr.Suzuki</p>
<br>
<br>
<p>I will do business report of today.</p>
<br>
<br>
<p>■Time leaving home</p>
<p>9:00-18:00</p>
<br>
<br>
<p>■Today's work content</p>
<p>・6.0h XXXProject - Implementation of JavaScript</p>
<p>・2.0h YYYProject - Create automated library</p>
<br>
<br>
<p>■Today's impression</p>
<p>・Today the weather was nice the day</p>
<br>
<br>
<p>■Concern in progress</p>
<p>・nothing</p>
```

### Run Application
Capture the confirmation screen before sending the daily report.

It is stored in the capture folder.
```
cd auto-report-dneo
npm run start
```
or
```
cd auto-report-dneo
yarn run start
```
