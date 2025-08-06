i still have issues. fix please.

1. still - requests.js:1 
 DELETE http://localhost:4000/api/v1/media/5 422 (Unprocessable Content)
initInterceptor.s.XMLHttpRequest.send	@	requests.js:1
(anonymous)	@	traffic.js:1
Promise.then		
handleMediaDelete	@	Profile.jsx:180
await in handleMediaDelete		
onClick	@	MediaGallery.jsx:68
Profile.jsx:184 Delete media error: 
AxiosError {message: 'Request failed with status code 422', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
handleMediaDelete	@	Profile.jsx:184
await in handleMediaDelete		
onClick	@	MediaGallery.jsx:68. 

after that error some time and media removed.

2. also please Operation Failed
Operation failed.
OK - be sweetallert as warning but error. all errors must be sweetallert and same like warning ui style, but error icon here.



PS. Please, if you create tests, move them to frontend_tests and backend_tests so we have only one folder for each type. Upgrade the organization of these folders every time after you test the app. Our permanent goal is to keep the app well organized. All tests must also be emoji-free, with clear, professional respectful language and student-friendly messages (not AI-like) style. remove all emoji usage everywhere, so student-friendly and professional (not AI-like) be everywhere at the project. not AI-like. i want student project-like, i want nobody know that i use ai. let comments be not like AI-generated. Centralize all alerts in validationAlerts.js with sweetallert, not standart allerts. always update ROADMAP.md after code changes.