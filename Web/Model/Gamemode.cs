namespace SnakeApp.Model;

public class Gamemode
{
    public string Name { get; set; }

    public string Description { get; set; }

    public int Size { get; set; }

    public int FruitSpawnChance { get; set; }

    public int FruitSpawnPositionTries { get; set; }

    public int FruitSpawnNumber { get; set; }

    public int FruitMaxAmount { get; set; }

    public int TickMiliseconds { get; set; }
}
