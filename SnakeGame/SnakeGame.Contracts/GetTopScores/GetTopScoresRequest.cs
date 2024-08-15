using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SnakeGame.Contracts.GetTopScores;

public class GetTopScoresRequest
{
    public string GameMode { get; set; }

    public int Amount { get; set; }
}
