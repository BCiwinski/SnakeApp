using Microsoft.AspNetCore.Mvc;
using SnakeApp.Contracts;
using SnakeGame.Contracts.GetTopScores;
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

    [HttpGet("top")]
    async public Task<GetTopScoresResponse> GetTopScores([FromQuery] GetTopScoresRequest request)
    {
        var scores = await _service.GetTopScores(request.Amount, request.GameMode);

        var dtos = scores
            .Select(s => new ScoreDto()
            {
                Name = s.Name,
                GameMode = s.GameMode,
                Score = s.Value,
                CreatedAt = s.CreatedAt
            })
            .ToList();

        var response = new GetTopScoresResponse() { Scores = dtos };

        return response;
    }
}
