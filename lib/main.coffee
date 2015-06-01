AutocompletePolymerView = require './autocomplete-polymer-view'
{CompositeDisposable} = require 'atom'
provider = require './provider'
updater = require './updater'

module.exports = AutocompletePolymer =
  autocompletePolymerView: null
  modalPanel: null
  subscriptions: null

  activate: (state) ->
    provider.loadCompletions()
    @autocompletePolymerView = new AutocompletePolymerView(state.autocompletePolymerViewState)
    @modalPanel = atom.workspace.addModalPanel(item: @autocompletePolymerView.getElement(), visible: false)
    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable

    # Register command that toggles this view
    @subscriptions.add atom.commands.add 'atom-workspace', 'autocomplete-polymer:update': => @update()

  deactivate: ->
    @modalPanel.destroy()
    @subscriptions.dispose()
    @autocompletePolymerView.destroy()

  serialize: ->
    autocompletePolymerViewState: @autocompletePolymerView.serialize()

  getProvider: -> provider

  update: ->
    updater.runUpdate(provider, this)

  updateDone: ->
    @modalPanel.show()
    setTimeout (->
      @modalPanel.hide()
      return
    ).bind(this), 2000
