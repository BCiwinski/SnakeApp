namespace SnakeGame.Contracts.GetTopScores;

public class ScoreDto
{
    public string Name { get; set; }

    public string GameMode { get; set; }

    public int Score { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}
