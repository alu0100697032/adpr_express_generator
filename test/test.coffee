chai     = require 'chai'
expect   = chai.expect
routes = require "../routes/index"

describe "routes", ->
  req = {}
  res = {}
  describe "index", ->
    it "should display index with posts", ->
      res.render = (view, vars) ->
          expect(view).equal "index"
          expect(vars.title).equal "ADPR"
      routes.index(req, res)