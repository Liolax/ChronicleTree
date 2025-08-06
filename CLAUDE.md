1. i still cant make molly alive. requests.js:1 
 PATCH http://localhost:4000/api/v1/people/26 500 (Internal Server Error)
initInterceptor.s.XMLHttpRequest.send	@	requests.js:1
(anonymous)	@	traffic.js:1
Promise.then		
handleSave	@	ProfileDetails.jsx:47
onSubmit	@	ProfileDetails.jsx:107
<form>		
ProfileDetails	@	ProfileDetails.jsx:107
ProfileDetails.jsx:60 Profile update error: 
AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}
code
: 
"ERR_BAD_RESPONSE"
config
: 
{transitional: {…}, adapter: Array(3), transformRequest: Array(1), transformResponse: Array(1), timeout: 0, …}
message
: 
"Request failed with status code 500"
name
: 
"AxiosError"
request
: 
XMLHttpRequest {requestMethod: 'PATCH', __METHOD__: 'PATCH', __URL__: 'http://localhost:4000/api/v1/people/26', readyState: 4, onreadystatechange: ƒ, …}
response
: 
{data: {…}, status: 500, statusText: 'Internal Server Error', headers: AxiosHeaders, config: {…}, …}
status
: 
500
stack
: 
"AxiosError: Request failed with status code 500\n    at settle (http://localhost:5178/node_modules/.vite/deps/axios.js?v=9e6c1091:1232:12)\n    at XMLHttpRequest.onloadend (http://localhost:5178/node_modules/.vite/deps/axios.js?v=9e6c1091:1564:7)\n    at Axios.request (http://localhost:5178/node_modules/.vite/deps/axios.js?v=9e6c1091:2122:41)\n    at async handleSave (http://localhost:5178/src/components/Profile/ProfileDetails.jsx?t=1754461929341:57:19)"
[[Prototype]]
: 
Error
requests.js:1 
 PUT http://localhost:4000/api/v1/people/26 500 (Internal Server Error)
initInterceptor.s.XMLHttpRequest.send	@	requests.js:1
(anonymous)	@	traffic.js:1
Promise.then		
mutationFn	@	people.js:89
await in execute		
handleSubmit	@	EditPersonModal.jsx:21
onSubmit	@	EditPersonForm.jsx:130
<form>		
EditPersonForm	@	EditPersonForm.jsx:134
<EditPersonForm>		
EditPersonModal	@	EditPersonModal.jsx:40
<EditPersonModal>		
FamilyTree	@	FamilyTreeFlow.jsx:575




I found Molly in the seeds. Molly is person ID 30 in the seeds,
  but in the database she might have a different ID (26 as mentioned in the user's error). check why person id 26 is affect molly and robert marriage. to fix it check seeds, schema, all backend, frontend, check rails attack and other possible causes. if robert has no current marriages i can set deathdate of molly to null to make her alive and the marriage of them will be current. 




PS. Please, if you create tests, move them to frontend_tests and backend_tests so we have only one folder for each type. Upgrade the organization of these folders every time after you test the app. Our permanent goal is to keep the app well organized. All tests must also be emoji-free, with clear, professional respectful language and student-friendly messages (not AI-like) style. remove all emoji usage everywhere, so student-friendly and professional (not AI-like) be everywhere at the project. not AI-like. i want student project-like, i want nobody know that i use ai. let comments be not like AI-generated. Centralize all alerts in validationAlerts.js with sweetallert, not standart allerts. always update ROADMAP.md after code changes.