# Axel Nilsson Examination 1DV032

## Diary
### Wen 20/10/16
I started by reading though the examination and looking at the Hours github page to get an idea of where I should start.

I then started with the vagrant version of the implementation. I started by creating the Vagrantfile and defining setting my machine to a Ubuntu 14.04 machine. Then i creates an update script which updates Ubuntu and installed important parts like git-core and build-essential.

Next step was to install Ruby. I started by creating a script which installed Ruby 2.3.1 with rbenv. I had experimented with it during the first exercise but had problems with it then which I managed to figure out. This script also installs bundler.

Then I added all other dependencies mentioned under System Dependencies, or atleast I thought. I then followed the instruction and ran the /bin/setup script. When running bundle install I found missing dependencies every time I ran the script, so I spent quite a long time running the script, getting error messages and added missing dependencies to be downloaded through apt. And this kept going the rest of the day, and after several failed attempts and quite alot of goolging I gave up for the day.

### Thu 21/10/16
I continued tackling my dependency problem today by adding scripts to install parts that where failing in the bundle install. I started by switching from rbenv to rvm, just to see if that made any diffrence, but it did not.

I found that the install that failed was either unf_ext or capybara-webkit, and I think the problems had something to do with QT and Qmake. but the error where not very clear at this point. I found some instructions on [Installing Qt and compiling capybara webkit](https://github.com/thoughtbot/capybara-webkit/wiki/Installing-Qt-and-compiling-capybara-webkit#ubuntu-trusty-1404) which helped a bit but the installation still failed. I decided to try to move to Ubuntu 16.04 to see if that made a diffrence, which it did and bundle install now works using ubuntu 16.04.

Next problem has something to do with postgres. When the setup script runs the "bundle exec rake db:setup" command it produces the error "FATAL:  role "ubuntu" does not exist". And I don't have time to fix that today so that will be fixed tomorrow.

### Fri 22/10/16
Started by fixing the problem with missing role in the postgres database. It was not easy finding a solid answer on google, but after a while I found the commands which creates an ubuntu user and a database.

* Tried getting pow to work, but it seems to only work on OSX
