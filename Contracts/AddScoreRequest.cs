using System.ComponentModel.DataAnnotations;

namespace SnakeApp.Contracts;

public class AddScoreRequest
{
    public string Name { get; set; }

    public int Score { get; set; }
}
