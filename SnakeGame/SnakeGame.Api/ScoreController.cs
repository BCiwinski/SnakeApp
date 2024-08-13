using Microsoft.AspNetCore.Mvc;
using SnakeApp.Contracts;

namespace SnakeApp.Controllers;

[ApiController]
[Route("score")]
public class ScoreController : ControllerBase
{

    [HttpPost("add")]
    async public Task<ActionResult> AddScore([FromBody] AddScoreRequest request)
    {
        return Ok();
    }
}
