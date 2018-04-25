/* Prototype of an League */
exports.League = {
    init: function (id, title, matchDayAmount, teams) {
        this.ID = id;
        this.Title = title;
        this.MatchDayAmount = matchDayAmount;
        this.Teams = teams;

        return this;
    }
};

/* Helper function to create an League object */
exports.create = function (id, title, matchDayAmount, teams) {
    return Object.create(exports.League).init(id, title, matchDayAmount, teams);
};