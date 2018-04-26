/* Prototype of a Team Row */
exports.TeamRow = {
    init: function (ID, Name, PlayedMatches, Wins, Draws, Losses, GoalsInFavor, GoalsAgainst, GoalDifference, Points) {
        this.ID = ID;
        this.Name = Name;
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
exports.create = function (ID, Name) {
    return Object.create(exports.TeamRow).init(ID, Name, 0, 0, 0, 0, 0, 0, 0, 0);
}