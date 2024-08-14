namespace SnakeApp.Contracts;

public class AddScoreRequest
{
    public string Name { get; set; }

    public string GameMode { get; set; }

    public int Score { get; set; }
}
