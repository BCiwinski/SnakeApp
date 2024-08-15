namespace SnakeGame.Infrastructure.Entities;

public class Score
{
    public int Id { get; set; }

    public string Name { get; set; }

    public string GameMode {  get; set; }

    public int Value { get; set; }
    
    public DateTimeOffset CreatedAt { get; set; }
}
