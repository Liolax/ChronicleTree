i still have issues. fix please.

1. 
still some Blocked aria-hidden on an element because its descendant retained focus. The focus must not be hidden from assistive technology users. Avoid using aria-hidden on a focused element or its ancestor. Consider using the inert attribute instead, which will also prevent focus. For more details, see the aria-hidden section of the WAI-ARIA specification at https://w3c.github.io/aria/#aria-hidden.
Element with focus: <button.inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-indigo-600 hover:bg-indigo-700 text-white border-transparent focus:ring-indigo-500 >
Ancestor with aria-hidden: <div#root> <div id=​"root" bis_skin_checked=​"1" aria-hidden=​"true">​…​</div>​Understand this warning
requests.js:1  POST http://localhost:4000/api/v1/people 422 (Unprocessable Content) - at tree view page. 

2. why warnings and errors isnt like on profile page ui styling and still apper under modals? please fix it, maybe should set xyz?

3. why its error, but no warning? requests.js:1 
 POST http://localhost:4000/api/v1/people 422 (Unprocessable Content)
people.js:77 === ADD PERSON ERROR DETAILS ===
people.js:78 Status: 422
people.js:79 Error data: 
{status: 422, error: 'Unprocessable Content', exception: '#<ActiveRecord::RecordInvalid: Validation failed: …8.3 years old. Minimum marriage age is 16 years.>', traces: {…}}
people.js:80 Full error: 
AxiosError {message: 'Request failed with status code 422', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
people.js:81 ================================
validationAlerts.js:129 === 422 VALIDATION ERROR ===
validationAlerts.js:130 Raw error message: #<ActiveRecord::RecordInvalid: Validation failed: Carol Smith is only 8.3 years old. Minimum marriage age is 16 years.>
validationAlerts.js:131 Error data structure: 
{status: 422, error: 'Unprocessable Content', exception: '#<ActiveRecord::RecordInvalid: Validation failed: …8.3 years old. Minimum marriage age is 16 years.>', traces: {…}}
validationAlerts.js:132 ===========================
validationAlerts.js:149 ✓ Detected as marriage age error
validationAlerts.js:150 Error message was: #<ActiveRecord::RecordInvalid: Validation failed: Carol Smith is only 8.3 years old. Minimum marriage age is 16 years.>
. and check others on the page tree.

PS. Please, if you create tests, move them to frontend_tests and backend_tests so we have only one folder for each type. Upgrade the organization of these folders every time after you test the app. Our permanent goal is to keep the app well organized. All tests must also be emoji-free, with clear, professional respectful language and student-friendly messages (not AI-like) style. remove all emoji usage everywhere, so student-friendly and professional (not AI-like) be everywhere at the project. not AI-like. i want student project-like, i want nobody know that i use ai. let comments be not like AI-generated. Centralize all alerts in validationAlerts.js with sweetallert, not standart allerts. always update ROADMAP.md after code changes.