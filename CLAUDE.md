i still have issues. fix please.

1. why Delete Fact
Are you sure you want to delete this fact? This action cannot be undone.
Cancel
Delete and other sweetallert isnt showing well? it must be at center of the screen as usual and like a toggle.  
2. when i update basic information data the screen must be updated automatically.
3. fix that situation. first, the error - Failed to load resource: the server responded with a status of 500 (Internal Server Error)Understand this error
MediaForm.jsx:119 Media save error: AxiosError
overrideMethod @ hook.js:608
await in overrideMethod
executeDispatch @ react-dom_client.js?v=bb9d7241:11736
runWithFiberInDEV @ react-dom_client.js?v=bb9d7241:1485
processDispatchQueue @ react-dom_client.js?v=bb9d7241:11772
(anonymous) @ react-dom_client.js?v=bb9d7241:12182
batchedUpdates$1 @ react-dom_client.js?v=bb9d7241:2628
dispatchEventForPluginEventSystem @ react-dom_client.js?v=bb9d7241:11877
dispatchEvent @ react-dom_client.js?v=bb9d7241:14792
dispatchDiscreteEvent @ react-dom_client.js?v=bb9d7241:14773
<form>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=d118ca30:250
MediaForm @ MediaForm.jsx:119
react-stack-bottom-frame @ react-dom_client.js?v=bb9d7241:17424
renderWithHooksAgain @ react-dom_client.js?v=bb9d7241:4281
renderWithHooks @ react-dom_client.js?v=bb9d7241:4217
updateFunctionComponent @ react-dom_client.js?v=bb9d7241:6619
beginWork @ react-dom_client.js?v=bb9d7241:7654
runWithFiberInDEV @ react-dom_client.js?v=bb9d7241:1485
performUnitOfWork @ react-dom_client.js?v=bb9d7241:10868
workLoopSync @ react-dom_client.js?v=bb9d7241:10728
renderRootSync @ react-dom_client.js?v=bb9d7241:10711
performWorkOnRoot @ react-dom_client.js?v=bb9d7241:10330
performSyncWorkOnRoot @ react-dom_client.js?v=bb9d7241:11635
flushSyncWorkAcrossRoots_impl @ react-dom_client.js?v=bb9d7241:11536
processRootScheduleInMicrotask @ react-dom_client.js?v=bb9d7241:11558
(anonymous) @ react-dom_client.js?v=bb9d7241:11649
<MediaForm>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=d118ca30:250
Profile @ Profile.jsx:493
react-stack-bottom-frame @ react-dom_client.js?v=bb9d7241:17424
renderWithHooksAgain @ react-dom_client.js?v=bb9d7241:4281
renderWithHooks @ react-dom_client.js?v=bb9d7241:4217
updateFunctionComponent @ react-dom_client.js?v=bb9d7241:6619
beginWork @ react-dom_client.js?v=bb9d7241:7654
runWithFiberInDEV @ react-dom_client.js?v=bb9d7241:1485
performUnitOfWork @ react-dom_client.js?v=bb9d7241:10868
workLoopSync @ react-dom_client.js?v=bb9d7241:10728
renderRootSync @ react-dom_client.js?v=bb9d7241:10711
performWorkOnRoot @ react-dom_client.js?v=bb9d7241:10330
performSyncWorkOnRoot @ react-dom_client.js?v=bb9d7241:11635
flushSyncWorkAcrossRoots_impl @ react-dom_client.js?v=bb9d7241:11536
processRootScheduleInMicrotask @ react-dom_client.js?v=bb9d7241:11558
(anonymous) @ react-dom_client.js?v=bb9d7241:11649Understand this error . but after page reloading the media appears.


PS. Please, if you create tests, move them to frontend_tests and backend_tests so we have only one folder for each type. Upgrade the organization of these folders every time after you test the app. Our permanent goal is to keep the app well organized. All tests must also be emoji-free, with clear, professional respectful language and student-friendly messages (not AI-like) style. remove all emoji usage everywhere, so student-friendly and professional (not AI-like) be everywhere at the project. not AI-like. i want student project-like, i want nobody know that i use ai. let comments be not like AI-generated. Centralize all alerts in validationAlerts.js with sweetallert, not standart allerts. always update ROADMAP.md after code changes.