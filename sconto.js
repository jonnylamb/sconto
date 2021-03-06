var Sconto = {

  Item: function(name, cost, discount) {
    this.name = name;
    this.cost = cost;
    this.discount = discount;
    if (typeof discount === 'undefined')
      this.discount = 0;
  },

  _hasDiscountedItems: function(items) {
    _.each(items, function(item) {
      if (item.discount > 0)
        return true;
    });
    return false;
  },

  _totalPrice: function(items) {
    var total = 0.0;
    _.each(items, function(item) {
      total += item.cost;
    });
    return total;
  },

  _removeItem: function(items, item) {
    var index = _.indexOf(items, item);
    if (index > -1)
      items.splice(index, 1);
    return items;
  },

  // thanks to http://codereview.stackexchange.com/questions/7001/better-way-to-generate-all-combinations
  combinations: function(items) {
    var fn = function(active, rest, others, arr) {
      if (active.length == 0 && rest.length == 0) {
        arr.push({ one: active, two: others });
        return arr;
      }
      if (rest.length == 0) {
        arr.push({ one: active, two: others });
      } else {
        fn(active.concat(rest[0]), rest.slice(1),
          Sconto._removeItem(others.slice(), rest[0]), arr);
        fn(active, rest.slice(1), others, arr);
      }
      return arr;
    }
    return fn([], items, items, []);
  },

  calculate: function(discountedItem, otherItems) {
    // y u do dis, some browsers?
    window.console || (console = { error: function() {} });

    if (discountedItem.discount == 0) {
      console.error("discounted item isn't actually discounted");
      return;
    }
    if (this._hasDiscountedItems(otherItems)) {
      console.error("other items shouldn't contain any other discounted items");
      return;
    }

    // work out all different combinations
    var options = this.combinations(otherItems);

    // work out totals for each combination
    var best;
    _.each(options, function(option) {
      // add discounted item to every option's first cart
      option.one = [discountedItem].concat(option.one);

      // totals
      option.totalOne = Sconto._totalPrice(option.one);
      option.totalTwo = Sconto._totalPrice(option.two);

      // total credit and remaining
      option.totalCredit = option.totalOne * discountedItem.discount / 100.0;
      option.remainingCredit = Math.max(0, option.totalCredit - option.totalTwo);

      // finally the important totals!
      option.totalTwo = Math.max(0, option.totalTwo - option.totalCredit);
      option.total = option.totalOne + option.totalTwo;

      if (!best) {
        best = option;
      } else {
        if (option.total < best.total)
          best = option;
        else if (option.total == best.total && option.totalTwo == 0)
          // prefer options which make paying for the second basket easier
          // (no money required)
          best = option;
      }
    });

    return best;
  }
}