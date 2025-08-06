i still have issues. fix please.

1. still timeout - requests.js:1 
 POST http://localhost:4000/api/v1/people/26/media 500 (Internal Server Error)
initInterceptor.s.XMLHttpRequest.send	@	requests.js:1
(anonymous)	@	traffic.js:1
Promise.then		
handleSubmit	@	MediaForm.jsx:32
<form>		
MediaForm	@	MediaForm.jsx:119
<MediaForm>		
Profile	@	Profile.jsx:506
MediaForm.jsx:39 Media save error: 
AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}
handleSubmit	@	MediaForm.jsx:39
<form>		
MediaForm	@	MediaForm.jsx:119
<MediaForm>		
Profile	@	Profile.jsx:506
.
Add Media
Failed to create media: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond. - user specified timeout: 3s (redis://localhost:6379) .

its because i have bad internet speed.

2. where is  Notes & Stories toast about update successfully? please add it to app.

PS. Please, if you create tests, move them to frontend_tests and backend_tests so we have only one folder for each type. Upgrade the organization of these folders every time after you test the app. Our permanent goal is to keep the app well organized. All tests must also be emoji-free, with clear, professional respectful language and student-friendly messages (not AI-like) style. remove all emoji usage everywhere, so student-friendly and professional (not AI-like) be everywhere at the project. not AI-like. i want student project-like, i want nobody know that i use ai. let comments be not like AI-generated. Centralize all alerts in validationAlerts.js with sweetallert, not standart allerts. always update ROADMAP.md after code changes.