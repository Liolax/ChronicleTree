1. fix please - User@DESKTOP-7NJPVKO MINGW64 ~/chronicle_tree/chronicle_tree_api (main)
$ bundle install
bin/rails s
Bundle complete! 25 Gemfile dependencies, 126 gems now installed.
Use `bundle info [gemname]` to see where a bundled gem is installed.
1 installed gem you directly depend on is looking for funding.
  Run `bundle fund` for details

(process:26992): VIPS-WARNING **: 05:08:40.618: unable to load "C:\Ruby33-x64\msys64\ucrt64/lib/vips-modules-8.16\vips-heif.dll" -- 'C:\Ruby33-x64\msys64\ucrt64/lib/vips-modules-8.16\vips-heif.dll': The specified module could not be found.

(process:26992): VIPS-WARNING **: 05:08:40.633: unable to load "C:\Ruby33-x64\msys64\ucrt64/lib/vips-modules-8.16\vips-jxl.dll" -- 'C:\Ruby33-x64\msys64\ucrt64/lib/vips-modules-8.16\vips-jxl.dll': The specified module could not be found.

(process:26992): VIPS-WARNING **: 05:08:40.647: unable to load "C:\Ruby33-x64\msys64\ucrt64/lib/vips-modules-8.16\vips-magick.dll" -- 'C:\Ruby33-x64\msys64\ucrt64/lib/vips-modules-8.16\vips-magick.dll': The specified module could not be found.

(process:26992): VIPS-WARNING **: 05:08:40.659: unable to load "C:\Ruby33-x64\msys64\ucrt64/lib/vips-modules-8.16\vips-openslide.dll" -- 'C:\Ruby33-x64\msys64\ucrt64/lib/vips-modules-8.16\vips-openslide.dll': The specified module could not be found.

(process:26992): VIPS-WARNING **: 05:08:40.671: unable to load "C:\Ruby33-x64\msys64\ucrt64/lib/vips-modules-8.16\vips-poppler.dll" -- 'C:\Ruby33-x64\msys64\ucrt64/lib/vips-modules-8.16\vips-poppler.dll': The specified module could not be found.
=> Booting Puma
=> Rails 8.0.2 application starting in development
=> Run `bin/rails server --help` for more startup options
[DEPRECATION] Rack::Attack.blocklisted_response is deprecated. Please use Rack::Attack.blocklisted_responder instead.
[DEPRECATION] Rack::Attack.throttled_response is deprecated. Please use Rack::Attack.throttled_responder instead
============================================================
VIPS MODULE INFO:
Optional VIPS modules (heif, jxl, magick, etc.) not found.
This is normal on Windows and doesn't affect functionality.
Basic image processing (PNG, JPEG, WebP) works normally.
============================================================
*** SIGUSR2 not implemented, signal based restart unavailable!
*** SIGUSR1 not implemented, signal based restart unavailable!
*** SIGHUP not implemented, signal based logs reopening unavailable!
Puma starting in single mode...
* Puma version: 6.6.0 ("Return to Forever")
* Ruby version: ruby 3.3.7 (2025-01-15 revision be31f993d7) [x64-mingw-ucrt]
*  Min threads: 3
*  Max threads: 3
*  Environment: development
*          PID: 26992
* Listening on http://[::1]:4000
* Listening on http://127.0.0.1:4000
Exiting
C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/puma-6.6.0/lib/puma/binder.rb:342:in `initialize': Only one usage of each socket address (protocol/network address/port) is normally permitted. - bind(2) for "127.0.0.1" port 4000 (Errno::EADDRINUSE)
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/puma-6.6.0/lib/puma/binder.rb:342:in `new'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/puma-6.6.0/lib/puma/binder.rb:342:in `add_tcp_listener'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/puma-6.6.0/lib/puma/binder.rb:171:in `block in parse'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/puma-6.6.0/lib/puma/binder.rb:154:in `each'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/puma-6.6.0/lib/puma/binder.rb:154:in `parse'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/puma-6.6.0/lib/puma/runner.rb:175:in `load_and_bind'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/puma-6.6.0/lib/puma/single.rb:44:in `run'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/puma-6.6.0/lib/puma/launcher.rb:203:in `run'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/puma-6.6.0/lib/rack/handler/puma.rb:79:in `run'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/rackup-2.2.1/lib/rackup/server.rb:341:in `start'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/railties-8.0.2/lib/rails/commands/server/server_command.rb:38:in `start'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/railties-8.0.2/lib/rails/commands/server/server_command.rb:145:in `block in perform'
        from <internal:kernel>:90:in `tap'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/railties-8.0.2/lib/rails/commands/server/server_command.rb:136:in `perform'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/thor-1.3.2/lib/thor/command.rb:28:in `run'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/thor-1.3.2/lib/thor/invocation.rb:127:in `invoke_command'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/railties-8.0.2/lib/rails/command/base.rb:178:in `invoke_command'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/thor-1.3.2/lib/thor.rb:538:in `dispatch'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/railties-8.0.2/lib/rails/command/base.rb:73:in `perform'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/railties-8.0.2/lib/rails/command.rb:65:in `block in invoke'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/railties-8.0.2/lib/rails/command.rb:143:in `with_argv'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/railties-8.0.2/lib/rails/command.rb:63:in `invoke'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/railties-8.0.2/lib/rails/commands.rb:18:in `<main>'
        from C:/Ruby33-x64/lib/ruby/3.3.0/bundled_gems.rb:69:in `require'
        from C:/Ruby33-x64/lib/ruby/3.3.0/bundled_gems.rb:69:in `block (2 levels) in replace_require'
        from C:/Ruby33-x64/lib/ruby/gems/3.3.0/gems/bootsnap-1.18.6/lib/bootsnap/load_path_cache/core_ext/kernel_require.rb:30:in `require'
        from bin/rails:4:in `<main>'


PS. Please, if you create tests, move them to frontend_tests and backend_tests so we have only one folder for each type. Upgrade the organization of these folders every time after you test the app. Our permanent goal is to keep the app well organized. All tests must also be emoji-free, with clear, professional respectful language and student-friendly messages (not AI-like) style. remove all emoji usage everywhere, so student-friendly and professional (not AI-like) be everywhere at the project. not AI-like. i want student project-like, i want nobody know that i use ai. let comments be not like AI-generated. Centralize all alerts in validationAlerts.js with sweetallert, not standart allerts. always update ROADMAP.md after code changes.