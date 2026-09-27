using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ticket_Management_System.DTOS;
using Ticket_Management_System.Models;

namespace Ticket_Management_System.Controllers;

[ApiController]
[Route("movies")]
public class MoviesController : ControllerBase
{
    private readonly TmsContext _context;
    public MoviesController(TmsContext context) => _context = context;

    private static object MapMovie(Movie m) => new
    {
        m.Id,
        m.Title,
        m.Genre,
        m.Language,
        m.DurationMinutes,
        m.Rating,
        m.Description,
        m.ReleaseDate,
        m.ImageUrl,
        m.BackdropUrl,
        m.IsActive
    };

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetMovies(
        [FromQuery] string? search = null,
        [FromQuery] string? genre = null,
        [FromQuery] string? language = null,
        [FromQuery] bool includeInactive = false)
    {
        var query = _context.Movies.AsQueryable();
        if (!includeInactive) query = query.Where(m => m.IsActive);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(m => m.Title.ToLower().Contains(s) || m.Description.ToLower().Contains(s));
        }
        if (!string.IsNullOrWhiteSpace(genre))
            query = query.Where(m => m.Genre.ToLower() == genre.ToLower());
        if (!string.IsNullOrWhiteSpace(language))
            query = query.Where(m => m.Language.ToLower() == language.ToLower());

        var movies = await query.OrderByDescending(m => m.ReleaseDate).Select(m => new
        {
            m.Id,
            m.Title,
            m.Genre,
            m.Language,
            m.DurationMinutes,
            m.Rating,
            m.Description,
            m.ReleaseDate,
            m.ImageUrl,
            m.BackdropUrl,
            m.IsActive
        }).ToListAsync();

        return Ok(movies);
    }

    [HttpGet("genres")]
    [AllowAnonymous]
    public async Task<IActionResult> GetGenres()
    {
        var genres = await _context.Movies.Where(m => m.IsActive)
            .Select(m => m.Genre).Distinct().OrderBy(g => g).ToListAsync();
        return Ok(genres);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetMovie(int id)
    {
        var movie = await _context.Movies.FirstOrDefaultAsync(m => m.Id == id);
        if (movie == null) return NotFound(new { message = "Movie not found." });

        var shows = await _context.Shows
            .Where(s => s.MovieId == id && s.StartTime >= DateTime.Now.AddHours(-1))
            .Include(s => s.Screen).ThenInclude(sc => sc.Theatre)
            .OrderBy(s => s.StartTime)
            .Select(s => new
            {
                s.Id,
                s.StartTime,
                s.TicketPrice,
                screenId = s.ScreenId,
                screen = s.Screen.Name,
                theatreId = s.Screen.TheatreId,
                theatre = s.Screen.Theatre.Name,
                city = s.Screen.Theatre.City,
                availableSeats = s.Screen.TotalSeats - s.Bookings
                    .Where(b => b.Status == "CONFIRMED")
                    .SelectMany(b => b.BookingSeats).Count()
            })
            .ToListAsync();

        return Ok(new
        {
            movie.Id,
            movie.Title,
            movie.Genre,
            movie.Language,
            movie.DurationMinutes,
            movie.Rating,
            movie.Description,
            movie.ReleaseDate,
            movie.ImageUrl,
            movie.BackdropUrl,
            movie.IsActive,
            shows
        });
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> CreateMovie([FromBody] MovieCreateDTO dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { message = "Title is required." });

        var movie = new Movie
        {
            Title = dto.Title.Trim(),
            Genre = dto.Genre,
            Language = dto.Language,
            DurationMinutes = dto.DurationMinutes,
            Rating = dto.Rating,
            Description = dto.Description,
            ReleaseDate = dto.ReleaseDate,
            ImageUrl = dto.ImageUrl,
            BackdropUrl = dto.BackdropUrl
        };
        _context.Movies.Add(movie);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetMovie), new { id = movie.Id }, MapMovie(movie));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> UpdateMovie(int id, [FromBody] MovieUpdateDTO dto)
    {
        var movie = await _context.Movies.FindAsync(id);
        if (movie == null) return NotFound(new { message = "Movie not found." });

        movie.Title = dto.Title.Trim();
        movie.Genre = dto.Genre;
        movie.Language = dto.Language;
        movie.DurationMinutes = dto.DurationMinutes;
        movie.Rating = dto.Rating;
        movie.Description = dto.Description;
        movie.ReleaseDate = dto.ReleaseDate;
        movie.ImageUrl = dto.ImageUrl;
        movie.BackdropUrl = dto.BackdropUrl;
        movie.IsActive = dto.IsActive;
        await _context.SaveChangesAsync();
        return Ok(MapMovie(movie));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> DeactivateMovie(int id)
    {
        var movie = await _context.Movies.FindAsync(id);
        if (movie == null) return NotFound(new { message = "Movie not found." });
        movie.IsActive = false;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Movie deactivated.", id = movie.Id });
    }
}
