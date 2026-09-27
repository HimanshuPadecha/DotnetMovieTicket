using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ticket_Management_System.DTOS;
using Ticket_Management_System.Models;

namespace Ticket_Management_System.Controllers;

[ApiController]
[Route("theatres")]
public class TheatresController : ControllerBase
{
    private readonly TmsContext _context;
    public TheatresController(TmsContext context) => _context = context;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetTheatres([FromQuery] string? city = null)
    {
        var query = _context.Theatres.Include(t => t.Screens).AsQueryable();
        if (!string.IsNullOrWhiteSpace(city))
            query = query.Where(t => t.City.ToLower() == city.ToLower());

        var theatres = await query.OrderBy(t => t.City).ThenBy(t => t.Name)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.City,
                t.Address,
                screens = t.Screens.Select(s => new { s.Id, s.Name, s.TotalSeats })
            }).ToListAsync();

        return Ok(theatres);
    }

    [HttpGet("cities")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCities()
    {
        var cities = await _context.Theatres.Select(t => t.City).Distinct().OrderBy(c => c).ToListAsync();
        return Ok(cities);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTheatre(int id)
    {
        var theatre = await _context.Theatres.Include(t => t.Screens)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (theatre == null) return NotFound(new { message = "Theatre not found." });

        return Ok(new
        {
            theatre.Id,
            theatre.Name,
            theatre.City,
            theatre.Address,
            screens = theatre.Screens.Select(s => new { s.Id, s.Name, s.TotalSeats })
        });
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> CreateTheatre([FromBody] TheatreCreateDTO dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.City))
            return BadRequest(new { message = "Name and city are required." });

        var theatre = new Theatre
        {
            Name = dto.Name.Trim(),
            City = dto.City.Trim(),
            Address = dto.Address?.Trim() ?? ""
        };
        _context.Theatres.Add(theatre);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetTheatre), new { id = theatre.Id }, new
        {
            theatre.Id,
            theatre.Name,
            theatre.City,
            theatre.Address,
            screens = Array.Empty<object>()
        });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> UpdateTheatre(int id, [FromBody] TheatreUpdateDTO dto)
    {
        var theatre = await _context.Theatres.FindAsync(id);
        if (theatre == null) return NotFound(new { message = "Theatre not found." });

        theatre.Name = dto.Name.Trim();
        theatre.City = dto.City.Trim();
        theatre.Address = dto.Address?.Trim() ?? "";
        await _context.SaveChangesAsync();
        return Ok(new { theatre.Id, theatre.Name, theatre.City, theatre.Address });
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> DeleteTheatre(int id)
    {
        var theatre = await _context.Theatres.Include(t => t.Screens).FirstOrDefaultAsync(t => t.Id == id);
        if (theatre == null) return NotFound(new { message = "Theatre not found." });

        var hasShows = await _context.Shows.AnyAsync(s => s.Screen.TheatreId == id);
        if (hasShows)
            return Conflict(new { message = "Cannot delete theatre with existing shows. Remove shows first." });

        _context.Screens.RemoveRange(theatre.Screens);
        _context.Theatres.Remove(theatre);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Theatre deleted." });
    }

    [HttpPost("screens")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> CreateScreen([FromBody] ScreenCreateDTO dto)
    {
        if (!await _context.Theatres.AnyAsync(t => t.Id == dto.TheatreId))
            return BadRequest(new { message = "Invalid theatreId." });

        var rows = Math.Clamp(dto.Rows, 1, 10);
        var seatsPerRow = Math.Clamp(dto.SeatsPerRow, 1, 20);
        var screen = new Screen
        {
            Name = dto.Name.Trim(),
            TheatreId = dto.TheatreId,
            TotalSeats = rows * seatsPerRow
        };
        _context.Screens.Add(screen);
        await _context.SaveChangesAsync();

        var seats = new List<Seat>();
        for (var r = 0; r < rows; r++)
        {
            var rowLetter = ((char)('A' + r)).ToString();
            for (var n = 1; n <= seatsPerRow; n++)
            {
                seats.Add(new Seat
                {
                    ScreenId = screen.Id,
                    SeatNumber = $"{rowLetter}{n}",
                    SeatType = r < 2 ? "PREMIUM" : "REGULAR"
                });
            }
        }
        _context.Seats.AddRange(seats);
        await _context.SaveChangesAsync();

        return Created("", new { screen.Id, screen.Name, screen.TheatreId, screen.TotalSeats });
    }
}
