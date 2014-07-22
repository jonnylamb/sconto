QUnit.test("create new discounted Item", function(assert) {
  var item = new Sconto.Item("name", 100.00, 20);

  assert.equal(item.name, "name");
  assert.equal(item.cost, 100.00);
  assert.equal(item.discount, 20);
});

QUnit.test("create new non-discounted Item", function(assert) {
  var item = new Sconto.Item("name", 50.00);

  assert.equal(item.name, "name");
  assert.equal(item.cost, 50.00);
  assert.equal(item.discount, 0);
});

QUnit.test("combinations", function(assert) {
  var c = Sconto.combinations(["one", "two", "three"]);

  assert.equal(c.length, 8);

  c.sort() // to ensure order
  assert.propEqual(c[0], { "one": ["one", "two", "three"], "two": [] });
  assert.propEqual(c[1], { "one": ["one", "two"], "two": ["three"] });
  assert.propEqual(c[2], { "one": ["one", "three"], "two": ["two"] });
  assert.propEqual(c[3], { "one": ["one"], "two": ["two", "three"] });
  assert.propEqual(c[4], { "one": ["two", "three"], "two": ["one"] });
  assert.propEqual(c[5], { "one": ["two"], "two": ["one", "three"] });
  assert.propEqual(c[6], { "one": ["three"], "two": ["one", "two"] });
  assert.propEqual(c[7], { "one": [], "two": ["one", "two", "three"] });
});

QUnit.test("simple best solution", function(assert) {
  var discounted = new Sconto.Item("million dollar chair", 130.00, 20);
  var others = [new Sconto.Item("cheap", 1.00)];
  var best = Sconto.calculate(discounted, others);

  assert.equal(best.total, 130.00);
  assert.equal(best.totalCredit, 26.00);
  assert.equal(best.remainingCredit, 25.00);
  assert.equal(best.totalOne, 130.00);
  assert.equal(best.totalTwo, 0.00);

  assert.equal(best.one.length, 1);
  assert.equal(best.two.length, 1);

  assert.propEqual(best.one[0], { name: "million dollar chair", cost: 130.00, discount: 20 });
  assert.propEqual(best.two[0], { name: "cheap", cost: 1.00, discount: 0 });
});

QUnit.test("solution making second basket zero", function(assert) {
  var discounted = new Sconto.Item("million dollar chair", 130.00, 20);
  var others = [
    new Sconto.Item("knives", 26.20),
    new Sconto.Item("pen", 1.00)];
  var best = Sconto.calculate(discounted, others);

  assert.equal(best.total, 131.00);
  assert.equal(best.totalCredit, 26.2);
  assert.equal(best.remainingCredit, 0.00);
  assert.equal(best.totalOne, 131.00);
  assert.equal(best.totalTwo, 0.00);

  assert.equal(best.one.length, 2);
  assert.equal(best.two.length, 1);

  best.one.sort(); // to ensure order
  assert.propEqual(best.one[0], { name: "million dollar chair", cost: 130.00, discount: 20 });
  assert.propEqual(best.one[1], { name: "pen", cost: 1.00, discount: 0 });
  assert.propEqual(best.two[0], { name: "knives", cost: 26.20, discount: 0 });
});

QUnit.test("solution with another large item", function(assert) {
  var discounted = new Sconto.Item("million dollar chair", 130.00, 20);
  var others = [
    new Sconto.Item("knives", 26.20),
    new Sconto.Item("pen", 1.00),
    new Sconto.Item("sofa", 400.00)];
  var best = Sconto.calculate(discounted, others);

  assert.equal(best.total, 525.76);
  assert.equal(best.totalCredit, 31.44);
  assert.equal(best.remainingCredit, 0.00);
  assert.equal(best.totalOne, 157.20);
  assert.equal(best.totalTwo, 368.56);

  assert.equal(best.one.length, 3);
  assert.equal(best.two.length, 1);

  best.one.sort(); // to ensure order
  assert.propEqual(best.one[0], { name: "million dollar chair", cost: 130.00, discount: 20 });
  assert.propEqual(best.one[1], { name: "knives", cost: 26.20, discount: 0 });
  assert.propEqual(best.one[2], { name: "pen", cost: 1.00, discount: 0 });
  assert.propEqual(best.two[0], { name: "sofa", cost: 400.00, discount: 0 });
});