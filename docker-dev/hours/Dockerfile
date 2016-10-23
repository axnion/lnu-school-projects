FROM ruby:2.3.1

RUN apt-get update && apt-get install -qq -y build-essential nodejs libpq-dev \
    postgresql-client-9.4 qt5-default libqt5webkit5-dev iceweasel \
    --fix-missing --no-install-recommends

ENV INSTALL_PATH /opt/hours
RUN mkdir -p $INSTALL_PATH

WORKDIR $INSTALL_PATH

COPY Gemfile Gemfile
COPY Gemfile.lock Gemfile.lock
RUN bundle install

COPY . .

CMD bundle exec unicorn -c config/unicorn.rb
