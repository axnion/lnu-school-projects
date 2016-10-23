FROM ruby:2.3.1-slim

RUN apt-get update && apt-get install -qq -y build-essential nodejs libpq-dev postgresql-client-9.4 qt5-default libqt5webkit5-dev --fix-missing --no-install-recommends

ENV INSTALL_PATH /hours
RUN mkdir -p $INSTALL_PATH

WORKDIR $INSTALL_PATH

COPY Gemfile Gemfile
RUN bundle install

COPY . .

CMD bundle exec unicorn -c config/unicorn.rb
