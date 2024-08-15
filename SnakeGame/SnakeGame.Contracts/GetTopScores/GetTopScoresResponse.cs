using System;
namespace SnakeGame.Contracts.GetTopScores;

public class GetTopScoresResponse
{
    public List<ScoreDto> Scores { get; set; }
}
