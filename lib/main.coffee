{CompositeDisposable} = require 'atom'
provider = require './provider'
updater = require './updater'

module.exports = AutocompletePolymer =
  activate: ->
    provider.loadCompletions()

    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable

    # Register command that toggles this view
    @subscriptions.add atom.commands.add 'atom-workspace', 'autocomplete-polymer:update': => @update()

  getProvider: -> provider

  update: ->
    updater.runUpdate(provider)
