using Microsoft.AspNetCore.Mvc;
using SnakeApp.Contracts;
using SnakeGame.Infrastructure;

namespace SnakeApp.Api;

[ApiController]
[Route("score")]
public class ScoreController : ControllerBase
{
    ScoreService _service;

    public ScoreController(ScoreService scoreService)
    {
        _service = scoreService;
    }


    [HttpPost("add")]
    async public Task<ActionResult> AddScore([FromBody] AddScoreRequest request)
    {
        await _service.AddScore(request.Name, request.GameMode, request.Score);

        return Ok();
    }
}
