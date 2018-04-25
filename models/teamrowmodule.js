/* Prototype of a Team Row */
exports.TeamRow = {
    init: function (PlayedMatches, Wins, Draws, Losses, GoalsInFavor, GoalsAgainst, GoalDifference, Points) {
        this.PlayedMatches = PlayedMatches;
        this.Wins = Wins;
        this.Draws = Draws;
        this.Losses = Losses;
        this.GoalsInFavor = GoalsInFavor;
        this.GoalsAgainst = GoalsAgainst;
        this.GoalDifference = GoalDifference;
        this.Points = Points;

        return this;
    }
};

/* Helper function to create an Team Row object */
exports.create = function (PlayedMatches, Wins, Draws, Losses, GoalsInFavor, GoalsAgainst, GoalDifference, Points) {
    return Object.create(exports.MatchDay).init(PlayedMatches, Wins, Draws, Losses, GoalsInFavor, GoalsAgainst, GoalDifference, Points);
};